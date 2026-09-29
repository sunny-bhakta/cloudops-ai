export interface AppConfig {
  port: number;
  groq: {
    apiKey: string;
    model: string;
  };
}

export function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),

    groq: {
      apiKey: process.env.GROQ_API_KEY ?? '',
      model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
    },
  };
}
