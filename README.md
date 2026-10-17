# LingoNova AI — Tutor de Idiomas Inteligente
> Implementação funcional independente e soberana baseada na Engenharia Reversa Funcional (REA) do TalkBud (talkbud.app).

---

## 1. Descrição do Produto

O **LingoNova AI** é um tutor de conversação e aprendizagem de idiomas de ponta a ponta com inteligência artificial generativa. Ele resolve o bloqueio da fala (*speaking anxiety*) e a discrepância entre vocabulário passivo e fluência ativa através de:
- **Tutor Conversacional Humanizado (Persona Aria)** com suporte bilíngue para travas e dúvidas em português.
- **Sistema de Correções Sanduíche**: valida o pensamento do aluno, introduz reformulações discretas (*"More naturally: ..."*) e mantém o ritmo com perguntas abertas.
- **Memória Semântica de Longo Prazo**: armazena fatos biográficos, preferências, metas e dificuldades gramaticais recorrentes com controle total de edição e exclusão (LGPD/GDPR).
- **Repetição Espaçada de Vocabulário (SRS SuperMemo SM-2)**: extrai automaticamente termos novos e expressões idiomáticas das conversas com flashcards interativos.
- **Prática por Voz & Texto**: gravação de áudio no navegador com transcrição e síntese vocal nativa.

---

## 2. Arquitetura Técnica

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│  - ActiveChatView (Áudio & Texto)                      │
│  - VocabularyNotebook (SRS SuperMemo SM-2 Flashcards)  │
│  - MemoryManager (Gestão Soberana de Memórias)         │
│  - ProgressView (Métricas de Fluência & Evidências)    │
│  - SettingsPrivacyView (LGPD & Direito ao Esquecimento)│
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (x-user-id)
┌───────────────────────────▼────────────────────────────┐
│          Backend Full-Stack (Node.js + Express)        │
│  - Ingress Router & Middleware (/api/*)                │
│  - Multi-tenant User Isolation Layer                   │
│  - Atomic Local Repository (.data/db.json)             │
│  - Automated Test Suite Runner (/api/tests/run)        │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
┌─────────────▼──────────┐ ┌─────────────▼──────────────┐
│  Google Gen AI SDK     │ │   Web Speech API / Audio   │
│  - Gemini 3.8 Flash    │ │   - SpeechRecognition STT  │
│  - Prompt Estruturado  │ │   - SpeechSynthesis TTS    │
│  - Fallback Resiliente │ │   - Pacing & Voice Tuning  │
└────────────────────────┘ └────────────────────────────┘
```

---

## 3. Pré-requisitos
- Node.js 20+ ou 22+
- npm 9+
- Chave de API do Google Gemini (`GEMINI_API_KEY`) no ambiente

---

## 4. Instalação & Execução Local

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Defina sua chave GEMINI_API_KEY no arquivo .env

# 3. Iniciar o servidor full-stack (Express + Vite na porta 3000)
npm run dev

# 4. Acessar a aplicação no navegador
# Abra http://localhost:3000
```

---

## 5. Configuração de Variáveis de Ambiente

Crie o arquivo `.env` com base no `.env.example`:

```env
# GEMINI_API_KEY: Chave da Google AI Studio / Gemini API
GEMINI_API_KEY="sua_chave_aqui"

# PORT: Porta do servidor (padrão: 3000)
PORT=3000

# NODE_ENV: 'development' ou 'production'
NODE_ENV=development
```

---

## 6. Persistência de Dados & Isolamento

- Os dados são isolados por `userId` em `.data/db.json` com cache em memória sincronizado atomicamente com o disco.
- O sistema inclui suporte ao **Direito ao Esquecimento (LGPD/GDPR)** via endpoint `DELETE /api/privacy/erase`.

---

## 7. Execução dos Testes Automatizados

O sistema conta com um runner automatizado cobrindo os **15 cenários de teste obrigatórios**:

```bash
# Executar a verificação de tipos e lint
npm run lint

# Executar a suíte de testes via API:
# GET http://localhost:3000/api/tests/run
```

Os 15 cenários cobertos incluem:
1. Cadastro e autenticação.
2. Isolamento de dados entre usuários (multi-tenant).
3. Persistência e recuperação de conversas ordenadas.
4. Correção gramatical contextual e falsos cognatos.
5. Respostas contextuais com perguntas de acompanhamento.
6. Preferências de correção (Modo Sutil vs. Detalhado vs. Livre).
7. Memória persistente entre sessões.
8. Edição e exclusão de memórias pelo usuário.
9. Resiliência a falhas de conexão com o modelo (fallback transparente).
10. Permissões e contingência de áudio.
11. Proteção de credenciais (chaves nunca expostas ao client).
12. Controle de acesso às rotas privadas.
13. Responsividade mobile e desktop.
14. Tratamento de entradas vazias ou inválidas.
15. Exclusão completa de dados (LGPD/GDPR).

---

## 8. Modelos de IA Suportados & Economia de Custos

O LingoNova AI suporta múltiplos provedores e modelos intercambiáveis diretamente nas **Configurações** ou via variáveis de ambiente:

| Provedor | Modelo | Custo Médio / 1M Tokens | Latência | Casos de Uso Recomendados |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini (Padrão)** | `gemini-3.1-flash-lite` | **~$0.075** | ~300ms | **Recomendado**: baratíssimo, excelente pedagogia, JSON nativo |
| **Google Gemini** | `gemini-3.8-flash` | ~$0.350 | ~600ms | Raciocínio gramatical profundo, explicações complexas |
| **DeepSeek (Chinesa)** | `deepseek-chat` (V3) | **~$0.140** | ~500ms | **Extrema economia**: excelente compreensão multilíngue |
| **Groq Cloud** | `llama-3.1-8b-instant` | Gratuito / $0.05 | **~180ms** | **Velocidade extrema**: ideal para conversas de voz em tempo real |
| **Groq Cloud** | `qwen-2.5-32b` (Alibaba) | ~$0.790 | ~250ms | Alta capacidade e precisão linguística |

---

## 9. Como Fazer Deploy na Vercel (Produção Instantânea)

O projeto já possui configuração nativa para a **Vercel** (`vercel.json` e `api/index.ts` serverless handler):

### Passo 1: Subir o código para o GitHub
```bash
# Se ainda não criou o repositório remoto no GitHub:
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
```

### Passo 2: Importar na Vercel
1. Acesse [vercel.com](https://vercel.com) e clique em **"Add New..." > "Project"**.
2. Conecte sua conta do GitHub e selecione o repositório `TalkBud-AI-Tutor` (ou o nome que escolher).
3. O Vercel detectará automaticamente o framework Vite.

### Passo 3: Configurar Variáveis de Ambiente na Vercel
Em **Environment Variables**, adicione:
- `GEMINI_API_KEY`: sua chave obtida no [Google AI Studio](https://aistudio.google.com/app/apikey)
- `GEMINI_MODEL`: `gemini-3.1-flash-lite` (opcional, já é o padrão)
- *(Opcional)* `DEEPSEEK_API_KEY`: se desejar usar o DeepSeek V3
- *(Opcional)* `GROQ_API_KEY`: se desejar usar o Groq Cloud

4. Clique em **"Deploy"**. Em menos de 2 minutos sua aplicação estará no ar com HTTPS gratuito, CDN global e funções serverless!

---

## 10. Estimativa de Custos Unitários

- **Inferência LLM (Gemini 3.1 Flash-Lite)**: ~$0.00007 por turno de conversação (~5x mais barato que o Gemini 3.8 Flash).
- **Inferência DeepSeek V3**: ~$0.00014 por turno.
- **Síntese Vocal (TTS)**: Gratuita via Web Speech API no navegador.
- **Transcrição de Voz (STT)**: Gratuita via Web Speech API no navegador.
- **Custo Operacional Total Estimado**: Menos de **$0.40 USD por aluno ativo/mês** (20 turnos diários). Margem bruta superior a 92% com assinaturas de R$ 39 a R$ 69/mês.

---

## 11. Limitações Conhecidas

- **Web Speech API**: A precisão do reconhecimento de voz e qualidade das vozes varia conforme o navegador (Google Chrome e Edge oferecem as vozes neurais mais naturais).
- **Fallback Sem Chave**: Caso o ambiente não possua chaves configuradas, o servidor ativa automaticamente o motor pedagógico de heurísticas locais para evitar interrupções de serviço.

