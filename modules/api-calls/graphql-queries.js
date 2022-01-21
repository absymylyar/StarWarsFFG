const api_uri = "https://localhost:44325/graphql";
const POST = "POST";
const content_type = "application/json";
const accept = "application/json";

const apiDataStore = {};

export function configureApiItemDialog(html, data) {
  const container = html.find(".open-description-icons");
  const eye = container && $(container).children(".api-dialog");
  const cog = eye && $(eye).children(".fa-spinner");
  if (eye && cog && data) {
    showApiItemDialog(eye, cog, data.flags.ffgimportid, data.type);
  }
}
export function configureCharacterTalentApiDialog(elem) {
  const key = elem.dataset["key"];
  const eye = $(elem.querySelector(".api-dialog"));
  const cog = $(elem.querySelector(".fa-spinner"));
  const type = "talent";
  if (eye && cog && key) {
    showApiItemDialog(eye, cog, key, type);
  }
}
export function configureCharacterSkillApiDialog(elem) {
  const key = elem.dataset["key"];
  const eye = $(elem.querySelector(".api-dialog"));
  const cog = $(elem.querySelector(".fa-spinner"));
  const type = "skill";
  if (eye && cog && key) {
    showApiItemDialog(eye, cog, key, type);
  }
}

function showApiItemDialog(eye, cog, key, type, language = "fr") {
  if (eye) {
    eye.on("click", async (event) => {
      $(event.currentTarget).addClass("visibility-hidden");
      if (cog) {
        $(cog).removeClass("visibility-hidden");
      }
      // const apiTalent = await getTalent(key, language);
      const apiTalent = await getApiData(key, type, language);
      const d = new Dialog({
        title: apiTalent.name,
        content: apiTalent.description,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            callback: () => d.close(),
          },
        },
        default: "one",
      });
      d.render(true);
      $(event.currentTarget).removeClass("visibility-hidden");
      $(cog).addClass("visibility-hidden");
    });
  }
}

async function getApiData(key, type, language = "fr") {
  const tmp = `${key}-${language}`;
  if (!apiDataStore[tmp]) {
    apiDataStore[tmp] = await getApiDataCall(key, type, language);
  }
  return apiDataStore[`${key}-${language}`];
}
async function getApiDataCall(key, type, language = "fr") {
  switch (type) {
    case "talent":
      return getTalent(key, language);
    case "skill":
      return getSkill(key, language);

    default:
      break;
  }
}
async function getSkill(key, language = "fr") {
  const talent_graph = `
query GetSkill($key: String!, $language: String!) {
  datas:skills(where: { key: $key, language: $language }) {
    name
    description
    id
    language
    key
  }
}
`;
  return getItem(talent_graph, key, language);
}
async function getTalent(key, language = "fr") {
  const talent_graph = `
query GetTalent($key: String!, $language: String!) {
  datas:talents(where: { key: $key, language: $language }) {
    name
    description
    id
    language
    force
    conflict
    ranked
    key
  }
}
`;
  return getItem(talent_graph, key, language);
}

async function getItem(graph, key, language = "fr") {
  return fetch(api_uri, {
    method: POST,
    headers: {
      "Content-Type": content_type,
      Accept: accept,
    },
    body: JSON.stringify({
      query: graph,
      variables: { key, language },
    }),
  })
    .then((r) => r.json())
    .then((data) => data.data.datas && data.data.datas[0]);
}
