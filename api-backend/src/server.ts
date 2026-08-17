import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT} em modo ${env.NODE_ENV}`);
});
