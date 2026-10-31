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


def _get_val(obj, key):
    if hasattr(obj, key):
        return getattr(obj, key)
    if isinstance(obj, dict):
        return obj.get(key)
    return None


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
        nodes = getattr(graph, "nodes", None) or graph.get("nodes")
        edges = getattr(graph, "edges", None) or graph.get("edges")

        self.assertIsNotNone(nodes)
        self.assertIsNotNone(edges)
        self.assertGreaterEqual(len(nodes), 10)
        self.assertGreater(len(edges), 0)

        # Verify required node fields per API contract: {id, label, type, country}
        for node in nodes:
            self.assertIsNotNone(_get_val(node, "id"))
            self.assertIsNotNone(_get_val(node, "label"))
            self.assertIsNotNone(_get_val(node, "type"))
            self.assertIsNotNone(_get_val(node, "country"))

        # Verify required edge fields per API contract: {source, target, relation, weight}
        for edge in edges:
            self.assertIsNotNone(_get_val(edge, "source"))
            self.assertIsNotNone(_get_val(edge, "target"))
            self.assertIsNotNone(_get_val(edge, "relation"))
            self.assertIsNotNone(_get_val(edge, "weight"))
            rel = _get_val(edge, "relation")
            self.assertIn(rel, ["complements", "same sector", "same market"])
            weight = _get_val(edge, "weight")
            self.assertGreater(weight, 0.0)
            self.assertLessEqual(weight, 1.0)

    def test_build_graph_with_startup_profile(self):
        startup = StartupProfile(
            company_name="SmartTONG (illustrative)",
            country="Malaysia",
            sector="smart_waste",
            solution="IoT ultrasonic bin sensors and dynamic routing",
            capabilities=["iot_fill_level_sensors", "route_optimization_software"],
            needs=["municipal_waste_concessions", "vietnam_local_distribution"],
            target_markets=["Vietnam", "Malaysia"],
            partnership_goals=["Deploy 500 smart bin sensors"],
        )

        graph = build_graph(startup=startup)
        nodes = getattr(graph, "nodes", None) or graph.get("nodes")
        edges = getattr(graph, "edges", None) or graph.get("edges")

        # Check startup node is present
        startup_nodes = [
            n for n in nodes if _get_val(n, "id") == "startup-smarttong-illustrative"
        ]
        self.assertEqual(len(startup_nodes), 1)
        s_node = startup_nodes[0]
        self.assertEqual(_get_val(s_node, "label"), "SmartTONG (illustrative)")
        self.assertEqual(_get_val(s_node, "country"), "Malaysia")

        # Check edges connected to startup
        s_id = _get_val(s_node, "id")
        connected_edges = [
            e
            for e in edges
            if _get_val(e, "source") == s_id or _get_val(e, "target") == s_id
        ]
        self.assertGreater(len(connected_edges), 0, "Startup must connect to relevant ecosystem nodes")

        # Check complementary match with Saigon Green Urban Waste Board
        saigon_edges = [
            e
            for e in connected_edges
            if _get_val(e, "source") == "partner-vn-01"
            or _get_val(e, "target") == "partner-vn-01"
        ]
        comp_edges = [e for e in saigon_edges if _get_val(e, "relation") == "complements"]
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
            "partnership_goals": ["Pilot sensors"],
        }
        graph = build_graph(startup=startup_dict)
        nodes = getattr(graph, "nodes", None) or graph.get("nodes")
        labels = {_get_val(n, "label") for n in nodes}
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
                "partnership_goals": ["Clean city"],
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
                "partnership_goals": ["Clean city"],
            },
        ]
        graph = build_graph(partners=custom_partners)
        nodes = getattr(graph, "nodes", None) or graph.get("nodes")
        edges = getattr(graph, "edges", None) or graph.get("edges")
        self.assertEqual(len(nodes), 2)
        relations = {_get_val(e, "relation") for e in edges}
        self.assertIn("complements", relations)
        self.assertIn("same sector", relations)
        self.assertIn("same market", relations)


if __name__ == "__main__":
    unittest.main()
