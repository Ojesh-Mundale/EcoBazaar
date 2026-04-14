export async function sendQuery(query) {
  const response = await fetch('/api/assistant/simple-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}
