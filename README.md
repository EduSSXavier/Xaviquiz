# XaviQuiz — Sistema de Quizzes Futurista

Aplicação web estática de quizzes pronta para ser hospedada no **GitHub Pages**.

## Características

- Lista de quizzes carregada a partir de um arquivo JSON principal (`quizzes/main.json`)
- Cada quiz é um arquivo JSON independente com suas questões
- Acesso direto a um quiz via parâmetro de URL: `?quiz=id-do-quiz`
- Contagem final de acertos e erros + percentual
- Revisão das questões erradas
- Opção de refazer o teste
- Design futurista (tema dark + neon) e totalmente responsivo (desktop e mobile)
- HTML + CSS + JavaScript puro (sem frameworks)

## Estrutura do Projeto

```
├── index.html
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── quizzes/
    ├── main.json                 # Lista de todos os quizzes
    ├── javascript-fundamentals.json
    ├── html-css.json
    ├── web-security.json
    └── futurismo-tech.json
```

## Formato dos JSONs

### `quizzes/main.json`

```json
{
  "quizzes": [
    {
      "id": "javascript-fundamentals",
      "title": "Fundamentos de JavaScript",
      "description": "Descrição curta do quiz",
      "file": "javascript-fundamentals.json",
      "icon": "⚡",
      "difficulty": "Iniciante"
    }
  ]
}
```

### Arquivo de um quiz (ex: `javascript-fundamentals.json`)

```json
{
  "title": "Fundamentos de JavaScript",
  "description": "Descrição opcional",
  "questions": [
    {
      "question": "Texto da pergunta?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correct": 2
    }
  ]
}
```

- `correct` é o **índice** (começando em 0) da opção correta.

## Como usar

### Localmente

Basta abrir o `index.html` em um servidor local (necessário por causa do `fetch` dos JSONs):

```bash
# Com Python
python -m http.server 8080

# Ou com Node (npx)
npx serve .
```

Acesse `http://localhost:8080`.

### GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos deste projeto
3. Em **Settings → Pages**, escolha a branch `main` (ou `master`) e a pasta `/ (root)`
4. Aguarde alguns minutos e acesse `https://seu-usuario.github.io/nome-do-repositorio/`

### Link direto para um quiz

```
https://seu-usuario.github.io/nome-do-repositorio/?quiz=javascript-fundamentals
```

O valor de `quiz` deve corresponder ao campo `id` definido em `main.json`.

## Adicionando novos quizzes

1. Crie um novo arquivo `.json` na pasta `quizzes/` seguindo o formato acima
2. Adicione uma entrada correspondente em `quizzes/main.json`
3. Pronto — a lista na página inicial será atualizada automaticamente

## Personalização

- Cores e efeitos: edite as variáveis CSS em `assets/css/style.css` (`:root`)
- Lógica e fluxos: `assets/js/app.js`

## Licença

MIT — use livremente.
