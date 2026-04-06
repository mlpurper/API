# O que eu fiz — explicado do zero

---

## O projeto em uma frase

Criei um **sistema que permite a parceiros da empresa consultar e gerenciar dados de Clientes, Produtos e Pedidos pela internet**, de forma segura e organizada.

---

## Mas o que é uma API?

Imagina que você vai a um restaurante.

- Você (o cliente) **não entra na cozinha** para pegar sua comida.
- Você fala com o **garçom**, que anota seu pedido, leva para a cozinha e te traz o resultado.

Uma **API** é esse garçom. É um intermediário que recebe pedidos de fora, busca os dados, e devolve a resposta — sem expor o que tem "lá dentro".

Os parceiros da empresa não acessam o banco de dados diretamente. Eles mandam pedidos para a API, e ela responde com as informações.

---

## O que é REST?

É um **conjunto de regras** de como a API se comunica. Pensa como um idioma padrão.

Toda comunicação é feita por **endereços** (chamados de rotas) e **verbos** que dizem o que você quer fazer:

| Verbo | O que significa | Exemplo do dia a dia |
|-------|----------------|----------------------|
| GET | Quero ver/buscar | "Me mostra a lista de clientes" |
| POST | Quero criar algo novo | "Cadastra esse novo cliente" |
| PATCH | Quero alterar algo | "Atualiza o telefone desse cliente" |
| DELETE | Quero apagar algo | "Remove esse pedido" |

---

## O que é MVC?

É uma forma de **organizar o código** para não virar uma bagunça. Divide o sistema em 3 partes:

```
Cliente (parceiro) → faz uma pergunta
        ↓
   CONTROLLER → é a "recepcionista": recebe a pergunta e sabe para quem encaminhar
        ↓
     MODEL → é o "especialista": sabe onde os dados estão e as regras de negócio
        ↓
   Resposta volta para o cliente
```

**Analogia:**
- **Model** = o estoque de verdade (sabe quantos produtos tem, valida se um e-mail é válido, etc.)
- **Controller** = o atendente (recebe a ligação, consulta o estoque, devolve a resposta)
- **Route** = o catálogo de ramais (qual número ligar para cada assunto)

---

## Os 3 domínios (assuntos) que a API gerencia

### 👤 Clientes (`/api/v1/customers`)
Tudo sobre os clientes da empresa.

| O que faz | Como pedir |
|-----------|-----------|
| Ver lista de clientes | GET /customers |
| Ver um cliente específico | GET /customers/123 |
| Cadastrar novo cliente | POST /customers |
| Alterar dados do cliente | PATCH /customers/123 |
| Remover cliente | DELETE /customers/123 |
| Ver resumo de pedidos do cliente | GET /customers/123/summary |

### 📦 Produtos (`/api/v1/products`)
Tudo sobre o catálogo de produtos.

| O que faz | Como pedir |
|-----------|-----------|
| Ver lista de produtos | GET /products |
| Ver um produto específico | GET /products/123 |
| Cadastrar novo produto | POST /products |
| Alterar produto | PATCH /products/123 |
| Remover produto | DELETE /products/123 |
| Ver estatísticas do catálogo | GET /products/stats |

### 🛒 Pedidos (`/api/v1/orders`)
Tudo sobre os pedidos realizados.

| O que faz | Como pedir |
|-----------|-----------|
| Ver lista de pedidos | GET /orders |
| Ver um pedido específico | GET /orders/123 |
| Criar novo pedido | POST /orders |
| Atualizar status do pedido | PATCH /orders/123 |
| Remover pedido | DELETE /orders/123 |
| Ver resumo geral de pedidos | GET /orders/summary |

---

## Como a segurança funciona?

A API usa uma **chave de acesso** (como uma senha secreta). Sem ela, ninguém de fora consegue usar.

O parceiro precisa enviar essa chave em todo pedido, no cabeçalho:
```
x-api-key: chave-secreta-aqui
```

Se não tiver a chave correta → a API recusa e devolve erro 401 (não autorizado).

A única exceção é o endereço `/health`, que serve só para verificar se o sistema está funcionando — esse não precisa de chave.

---

## O que acontece quando cria um pedido?

Não é só salvar os dados. O sistema faz várias verificações automáticas:

1. ✅ O cliente existe?
2. ✅ Os produtos existem?
3. ✅ Os produtos estão ativos (não foram desativados)?
4. ✅ Tem estoque suficiente de cada produto?
5. 💰 Calcula o total automaticamente (soma quantidade × preço de cada item)
6. 📦 Desconta do estoque automaticamente

Se qualquer verificação falhar, o pedido é recusado com uma mensagem explicando o problema.

---

## Regras de negócio importantes

- **E-mail duplicado**: não é possível cadastrar dois clientes com o mesmo e-mail.
- **SKU duplicado**: cada produto tem um código único (SKU) — não pode repetir.
- **Pedidos imutáveis**: pedidos com status `entregue` ou `cancelado` não podem mais ser alterados.
- **Exclusão de pedidos**: só é possível apagar pedidos que estejam `pendente` ou `cancelado`.
- **Status possíveis de um pedido**: `pending` → `processing` → `shipped` → `delivered` (ou `cancelled`)

---

## Como os dados ficam armazenados?

Atualmente, os dados ficam na **memória do servidor** (como um caderninho que existe enquanto o computador está ligado). Se o servidor reiniciar, os dados somem.

Isso é intencional para este projeto — em produção real, bastaria trocar por um banco de dados de verdade (como MySQL ou PostgreSQL), sem precisar mudar o resto do sistema.

---

## Estrutura dos arquivos

```
📁 projeto/
│
├── app.js              → Liga o servidor, configura as regras globais
├── routes.js           → Catálogo de todos os endereços disponíveis
├── middlewares.js      → Segurança, logs e paginação
│
├── 📁 models/          → As regras e os dados
│   ├── Customer.js     → Regras de cliente
│   ├── Product.js      → Regras de produto
│   └── Order.js        → Regras de pedido
│
├── 📁 controllers/     → Os atendentes de cada área
│   ├── CustomerController.js
│   ├── ProductController.js
│   └── OrderController.js
│
├── 📁 data/
│   └── store.js        → O "caderninho" onde os dados ficam guardados
│
└── api-docs.html       → Documentação visual e interativa da API
```

---

## Como rodar o sistema

1. Ter o **Node.js** instalado no computador
2. Abrir o terminal na pasta do projeto
3. Rodar: `npm install` (baixa as dependências, só precisa fazer uma vez)
4. Rodar: `npm start` (liga o servidor)
5. O sistema fica disponível em: `http://localhost:3000`

Para ver a documentação visual, abra o arquivo `api-docs.html` no navegador.

---

*Feito com Node.js + Express • Arquitetura REST/MVC*
