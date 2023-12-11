/* eslint-disable no-restricted-syntax */

export enum Routes {
  LOGIN = '/login',
  SELECT_PAGE = '/',
  APP_EMBED = '/app',
  OPTIONS = '/options',
  DOCUMENTS = '/doc',
  BUFFER = '/buffer',
  NEXT_PAGE = '/nextPage',
  TRUSTED_AUTH_PAGE = '/authPage',
  SUMMARY_PAGE = '/summaryPage',
}

interface Step {
  title: string;
  isSubStep?: boolean;
}

export const steps: Step[] = [
  {
    title: 'Set up your data model in ThoughtSpot',
  },
  {
    title: 'Select a project to connect to ThoughtSpot',
    isSubStep: true,
  },
  {
    title: 'Connect to your data',
    isSubStep: true,
  },
  {
    title: 'Create data model',
    isSubStep: true,
  },
  {
    title: 'Test embedding ThoughtSpot',
  },
  {
    title: 'Embed ThoughtSpot in your application',
  },
  {
    title: 'Deploy the Trusted Authentication template',
    isSubStep: true,
  },
  {
    title: 'Embed ThoughtSpot with Trusted Authentication',
    isSubStep: true,
  },
  {
    title: 'ThoughtSpot Integration Summary',
  },
];

/**
 *
 * @param tables
 * @param relationships
 * @returns An array with elements as Tables Names with joins between them
 * as a single element
 */
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
