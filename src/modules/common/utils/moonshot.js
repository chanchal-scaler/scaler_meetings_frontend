export async function fetchMoonshotLinks(link) {
  const resp = await fetch(link);
  const json = await resp.json();
  return json.links;
}

export async function fetchGroupMoonshotLinks(links) {
  const responses = await Promise.all(links.map(link => fetch(link)));

  const jsonPromises = responses.map(response => response.json());
  const jsonData = await Promise.all(jsonPromises);

  return jsonData.map(data => data.links);
}
