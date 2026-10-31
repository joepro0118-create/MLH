"""
Unit tests for Ecosystem Network Graph Service (backend/app/graph_service.py).
Pure Python, offline test suite.
"""

import unittest
from backend.app.graph_service import (
    StartupProfile,
    build_graph,
    load_ecosystem_data,
)


class TestGraphService(unittest.TestCase):
    def test_load_ecosystem_data(self):
        records = load_ecosystem_data()
        self.assertGreaterEqual(len(records), 10, "Should load at least 10 records from demo_ecosystem.json")
        for r in records:
            self.assertIn("id", r)
            self.assertIn("name", r)
            self.assertIn("type", r)
            self.assertIn(r["type"], ["organisation", "programme", "startup"])
            self.assertIn("country", r)
            self.assertIn("sector", r)
            self.assertTrue(r.get("illustrative"), "Each record must have illustrative: true")
            self.assertIn("(illustrative)", r["name"])

    def test_build_graph_without_startup(self):
        graph = build_graph()
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)

        nodes = graph["nodes"]
        edges = graph["edges"]

        self.assertGreaterEqual(len(nodes), 10)
        self.assertGreater(len(edges), 0)

        # Verify required node fields per API contract: {id, label, type, country}
        for node in nodes:
            self.assertIn("id", node)
            self.assertIn("label", node)
            self.assertIn("type", node)
            self.assertIn("country", node)

        # Verify required edge fields per API contract: {source, target, relation, weight}
        for edge in edges:
            self.assertIn("source", edge)
            self.assertIn("target", edge)
            self.assertIn("relation", edge)
            self.assertIn("weight", edge)
            self.assertIn(edge["relation"], ["complements", "same sector", "same market"])
            self.assertGreater(edge["weight"], 0.0)
            self.assertLessEqual(edge["weight"], 1.0)

    def test_build_graph_with_startup_profile(self):
        startup = StartupProfile(
            company_name="SmartTONG (illustrative)",
            country="Malaysia",
            sector="smart_waste",
            solution="IoT ultrasonic bin sensors and dynamic routing",
            capabilities=["iot_fill_level_sensors", "route_optimization_software"],
            needs=["municipal_waste_concessions", "vietnam_local_distribution"],
            target_markets=["Vietnam", "Malaysia"],
        )

        graph = build_graph(startup=startup)
        nodes = graph["nodes"]
        edges = graph["edges"]

        # Check startup node is present
        startup_nodes = [n for n in nodes if n.get("is_startup")]
        self.assertEqual(len(startup_nodes), 1)
        s_node = startup_nodes[0]
        self.assertEqual(s_node["id"], "startup-smarttong-illustrative")
        self.assertEqual(s_node["label"], "SmartTONG (illustrative)")
        self.assertEqual(s_node["country"], "Malaysia")
        self.assertTrue(s_node["is_startup"])

        # Check edges connected to startup
        s_id = s_node["id"]
        connected_edges = [
            e for e in edges if e["source"] == s_id or e["target"] == s_id
        ]
        self.assertGreater(len(connected_edges), 0, "Startup must connect to relevant ecosystem nodes")

        # Check complementary match with Saigon Green Urban Waste Board
        saigon_edges = [
            e
            for e in connected_edges
            if e["source"] == "partner-vn-01" or e["target"] == "partner-vn-01"
        ]
        comp_edges = [e for e in saigon_edges if e["relation"] == "complements"]
        self.assertGreater(len(comp_edges), 0, "Startup must complement Saigon Green Urban Waste Board")

    def test_build_graph_with_dict_startup(self):
        startup_dict = {
            "company_name": "EcoGenius (illustrative)",
            "country": "Malaysia",
            "sector": "smart_waste",
            "solution": "Cleantech waste telemetry",
            "capabilities": ["iot_fill_level_sensors"],
            "needs": ["municipal_waste_concessions"],
            "target_markets": ["Vietnam"],
        }
        graph = build_graph(startup=startup_dict)
        labels = {n["label"] for n in graph["nodes"]}
        self.assertIn("EcoGenius (illustrative)", labels)

    def test_build_graph_with_custom_mock_partners(self):
        custom_partners = [
            {
                "id": "test-p1",
                "name": "Partner A (illustrative)",
                "type": "organisation",
                "country": "Vietnam",
                "sector": "smart_waste",
                "capabilities": ["municipal_waste_concessions"],
                "needs": ["iot_fill_level_sensors"],
                "target_markets": ["Vietnam"],
            },
            {
                "id": "test-p2",
                "name": "Partner B (illustrative)",
                "type": "startup",
                "country": "Vietnam",
                "sector": "smart_waste",
                "capabilities": ["iot_fill_level_sensors"],
                "needs": ["municipal_waste_concessions"],
                "target_markets": ["Vietnam"],
            },
        ]
        graph = build_graph(partners=custom_partners)
        self.assertEqual(len(graph["nodes"]), 2)
        relations = {e["relation"] for e in graph["edges"]}
        self.assertIn("complements", relations)
        self.assertIn("same sector", relations)
        self.assertIn("same market", relations)


if __name__ == "__main__":
    unittest.main()
