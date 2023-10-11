/* eslint-disable no-restricted-syntax */
export default function findConnectedComponents(
  tables: any,
  relationships: any
): any {
  const graph: any = {};

  for (const relation of relationships) {
    for (const edge of relation) {
      if (!graph[edge.sourceTable]) {
        graph[edge.sourceTable] = [];
      }
      graph[edge.sourceTable].push(edge.destinationTable);

      if (!graph[edge.destinationTable]) {
        graph[edge.destinationTable] = [];
      }
      graph[edge.destinationTable].push(edge.sourceTable);
    }
  }

  const visited: Record<string, boolean> = {};
  const components: string[][] = [];

  function dfs(node: string, component: string[]) {
    visited[node] = true;
    component.push(node);

    if (graph[node] && Array.isArray(graph[node])) {
      graph[node]
        .filter((neighbor) => !visited[neighbor])
        .forEach((neighbor) => dfs(neighbor, component));
    }
  }

  for (const table of tables) {
    if (!visited[table]) {
      const component: string[] = [];
      dfs(table, component);
      components.push(component);
    }
  }

  components.sort((a, b) => b.length - a.length);
  return components;
}
