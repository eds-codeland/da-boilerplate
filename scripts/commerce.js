export const COMMERCE_CORE_ENDPOINT = 'https://www.aemshop.net/graphql';

export function getCommerceHeaders() {
  return {
    Store: 'default',
  };
}

export async function fetchCommerceGraphQL(query, variables = {}) {
  const res = await fetch(COMMERCE_CORE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCommerceHeaders(),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Commerce GraphQL HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Commerce GraphQL error');
  }

  return json;
}
