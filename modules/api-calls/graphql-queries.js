const api_uri = "http://88.180.155.170:15001/graphql";
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
  configureCharacterItemsApiDialog(elem, "talent");
}
export function configureCharacterForcePowerApiDialog(elem) {
  configureCharacterItemsApiDialog(elem, "force-power");
}
export function configureCharacterUpGradePowerApiDialog(elem) {
  configureCharacterItemsApiDialog(elem, "upgrade-power");
}
export function configureCharacterSkillApiDialog(elem) {
  configureCharacterItemsApiDialog(elem, "skill");
}
export async function configureEffectApiDialog(elem) {
  const key = elem.dataset["key"];
  const eye = $(elem.querySelector(".api-dialog"));
  const cog = $(elem.querySelector(".fa-spinner"));
  const apiData = await getApiData(key, "effect", "fr");
  const d = new Dialog({
    title: apiData.name,
    content: apiData.description,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        callback: () => d.close(),
      },
    },
    default: "one",
  });
  d.render(true);
  $(eye).removeClass("visibility-hidden");
  $(cog).addClass("visibility-hidden");
}
function configureCharacterItemsApiDialog(elem, type) {
  const key = elem.dataset["key"];
  const eye = $(elem.querySelector(".api-dialog"));
  const cog = $(elem.querySelector(".fa-spinner"));
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
      const apiData = await getApiData(key, type, language);
      const d = new Dialog({
        title: apiData.name,
        content: apiData.description,
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
    case "force-power":
      return getForcePower(key, language);
    case "upgrade-power":
      return getUpGradePower(key, language);
    case "effect":
      return getEffect(key, language);
    default:
      break;
  }
}
async function getEffect(key, language = "fr") {
  const effect_graph = `
  query GetEffect(
    $filterInput: EffectFilterInput
  ) {
  datas: effects(where: $filterInput) {
      name
      description
      id
      language
      key
    }
  }
`;
  return getItem(effect_graph, key, language);
}
async function getUpGradePower(key, language = "fr") {
  const upgrade_power_graph = `query GetPowerUpgrade($filterInput: PowerUpgradeFilterInput) {
    datas: powerUpgrades(where: $filterInput) {
      name
      description
      id
      language
      key
    }
  }`;
  return getItem(upgrade_power_graph, key, language);
}
async function getForcePower(key, language = "fr") {
  const force_power_graph = `
  query GetForcePower(
    $pfFilterInput: ForcePowerFilterInput,
    $puFilterInput: PowerUpgradeFilterInput
  ) {
    fp:forcePowers(where: $pfFilterInput) {
      name
      description
      id
      language
      key
    }
    up: powerUpgrades(where: $puFilterInput) {
      name
      description
      id
      language
      key
    }
  }
`;
const pfFilterInput = {
  key: {
    eq: key
  },
  language: {
    eq: language
  }
};
  return fetch(api_uri, {
    method: POST,
    headers: {
      "Content-Type": content_type,
      Accept: accept,
    },
    body: JSON.stringify({
      query: force_power_graph,
      variables : {
        pfFilterInput,
        puFilterInput: {
          ...pfFilterInput,
          key:{
            startsWith: key + "BASIC"
          }
        }
      },
    }),
  })
    .then((r) => r.json())
    .then(
      (data) =>
        data.data.fp && data.data.fp[0] + data.data.up && data.data.up[0]
    );
}
async function getSkill(key, language = "fr") {
  const skill_graph = `query GetSkill($filterInput: SkillFilterInput) {
    datas: skills(where: $filterInput) {
      name
      description
      id
      language
      key
    }
  }`;
  return getItem(skill_graph, key, language);
}
async function getTalent(key, language = "fr") {
  const talent_graph = `
query GetTalent(
  $filterInput: TalentFilterInput
) {
  datas:talents(where: $filterInput) {
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
      variables: {
        filterInput: {
          key: {
            eq: key
          },
          language: {
            eq: language
          }
        }
      },
    }),
  })
    .then((r) => r.json())
    .then((data) => data.data.datas && data.data.datas[0]);
}
