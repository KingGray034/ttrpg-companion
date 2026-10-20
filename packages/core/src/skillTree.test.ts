import { describe, it, expect } from "vitest";
import { countTags, detectActiveArchetypes, colorForNode, computeSkillTree } from "./skillTree";

function makeNode(overrides: Partial<Parameters<typeof countTags>[0][number]> & { id: string; tags: string[] }) {
  return {
    name: "Test Node",
    description: "",
    prerequisites: [],
    cost: 0,
    ...overrides,
  };
}

describe("countTags", () => {
  it("counts tag occurrences across nodes", () => {
    const nodes = [
      makeNode({ id: "1", tags: ["magic", "stealth"] }),
      makeNode({ id: "2", tags: ["magic"] }),
    ];
    expect(countTags(nodes)).toEqual({ magic: 2, stealth: 1 });
  });

  it("returns an empty object for no nodes", () => {
    expect(countTags([])).toEqual({});
  });
});

describe("detectActiveArchetypes", () => {
  it("returns tags meeting or exceeding their threshold", () => {
    const counts = { magic: 4, stealth: 1 };
    const thresholds = { magic: 3, stealth: 3 };
    expect(detectActiveArchetypes(counts, thresholds)).toEqual(["magic"]);
  });
});

describe("colorForNode", () => {
  const oppositionRules = { magic: ["anti-magic"] };

  it("colors a node green if it shares an active archetype tag", () => {
    const node = makeNode({ id: "n1", tags: ["magic"] });
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n1", color: "green", shape: "circle" });
  });

  it("colors a node red if it opposes an active archetype", () => {
    const node = makeNode({ id: "n2", tags: ["anti-magic"] });
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n2", color: "red", shape: "triangle" });
  });

  it("colors a node blue if neutral", () => {
    const node = makeNode({ id: "n3", tags: ["utility"] });
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n3", color: "blue", shape: "diamond" });
  });

  it("colors a node white if it has no tags", () => {
    const node = makeNode({ id: "n4", tags: [] });
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n4", color: "white", shape: "square" });
  });
});

describe("computeSkillTree", () => {
  it("runs the full pipeline end to end", () => {
    const allNodes = [
      makeNode({ id: "a", tags: ["magic"] }),
      makeNode({ id: "b", tags: ["anti-magic"] }),
      makeNode({ id: "c", tags: [] }),
    ];
    const owned = [
      makeNode({ id: "a", tags: ["magic"] }),
      makeNode({ id: "a2", tags: ["magic"] }),
      makeNode({ id: "a3", tags: ["magic"] }),
    ];
    const thresholds = { magic: 3 };
    const oppositionRules = { magic: ["anti-magic"] };

    const result = computeSkillTree(owned, allNodes, thresholds, oppositionRules);

    expect(result).toEqual([
      { nodeId: "a", color: "green", shape: "circle" },
      { nodeId: "b", color: "red", shape: "triangle" },
      { nodeId: "c", color: "white", shape: "square" },
    ]);
  });
});