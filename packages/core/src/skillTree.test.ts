import { describe, it, expect } from "vitest";
import { countTags, detectActiveArchetypes, colorForNode, computeSkillTree } from "./skillTree.js";

describe("countTags", () => {
  it("counts tag occurrences across nodes", () => {
    const nodes = [
      { id: "1", tags: ["magic", "stealth"] },
      { id: "2", tags: ["magic"] },
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
    const node = { id: "n1", tags: ["magic"] };
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n1", color: "green", shape: "circle" });
  });

  it("colors a node red if it opposes an active archetype", () => {
    const node = { id: "n2", tags: ["anti-magic"] };
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n2", color: "red", shape: "triangle" });
  });

  it("colors a node blue if neutral", () => {
    const node = { id: "n3", tags: ["utility"] };
    const result = colorForNode(node, ["magic"], oppositionRules);
    expect(result).toEqual({ nodeId: "n3", color: "blue", shape: "diamond" });
  });
});

describe("computeSkillTree", () => {
  it("runs the full pipeline end to end", () => {
    const allNodes = [
      { id: "a", tags: ["magic"] },
      { id: "b", tags: ["anti-magic"] },
      { id: "c", tags: [] },
    ];
    const owned = [
      { id: "a", tags: ["magic"] },
      { id: "a2", tags: ["magic"] },
      { id: "a3", tags: ["magic"] },
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