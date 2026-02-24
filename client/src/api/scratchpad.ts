import api from './client';

export async function getScratchpad(): Promise<{ content: string }> {
  const { data } = await api.get('/scratchpad');
  return data;
}

export async function updateScratchpad(content: string): Promise<void> {
  await api.put('/scratchpad', { content });
}
