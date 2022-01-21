export const talent_graph = `
query GetTalent($key: String!, $language: String!) {
  talents(where: { key: $key, language: $language }) {
    name
    description
    id
    language
    force
    conflict
    ranked
  }
}
`;
