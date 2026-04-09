import { useState, useEffect, useRef } from "react";

// ─── Red-Black Tree Engine ───
const RED = "RED";
const BLACK = "BLACK";
let _nodeCounter = 0;

function createNode(key, color = RED) {
  return { key, color, left: null, right: null, parent: null, id: ++_nodeCounter };
}

function cloneTree(node, parent = null) {
  if (!node) return null;
  const n = { ...node, parent, left: null, right: null };
  n.left = cloneTree(node.left, n);
  n.right = cloneTree(node.right, n);
  return n;
}

function findNode(node, key) {
  if (!node) return null;
  if (key === node.key) return node;
  return key < node.key ? findNode(node.left, key) : findNode(node.right, key);
}

function minimum(node) {
  while (node.left) node = node.left;
  return node;
}

function leftRotate(root, x) {
  const y = x.right;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rightRotate(root, y) {
  const x = y.left;
  y.left = x.right;
  if (x.right) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) root = x;
  else if (y === y.parent.left) y.parent.left = x;
  else y.parent.right = x;
  x.right = y;
  y.parent = x;
  return root;
}

function rbInsert(root, key) {
  const steps = [];
  const z = createNode(key, RED);
  let y = null, x = root;
  while (x) {
    y = x;
    x = key < x.key ? x.left : x.right;
  }
  z.parent = y;
  if (!y) root = z;
  else if (key < y.key) y.left = z;
  else y.right = z;

  steps.push({ tree: cloneTree(root), msg: `inserir: ${key} inserido como vermelho`, highlight: key, type: "insert", func: "inserir" });

  let node = z;
  while (node.parent && node.parent.color === RED) {
    if (node.parent === node.parent.parent?.left) {
      const uncle = node.parent.parent?.right;
      if (uncle && uncle.color === RED) {
        node.parent.color = BLACK;
        uncle.color = BLACK;
        node.parent.parent.color = RED;
        steps.push({ tree: cloneTree(root), msg: `corrigirInsercao Caso 1: tio vermelho → recolorir`, highlight: key, type: "recolor", func: "corrigirInsercao" });
        node = node.parent.parent;
      } else {
        if (node === node.parent.right) {
          node = node.parent;
          root = leftRotate(root, node);
          steps.push({ tree: cloneTree(root), msg: `rotacionarEsquerda: rotação à esquerda`, highlight: key, type: "rotate", func: "rotacionarEsquerda" });
        }
        node.parent.color = BLACK;
        if (node.parent.parent) node.parent.parent.color = RED;
        root = rightRotate(root, node.parent.parent);
        steps.push({ tree: cloneTree(root), msg: `rotacionarDireita + recolorir: Caso 3`, highlight: key, type: "rotate", func: "rotacionarDireita" });
      }
    } else {
      const uncle = node.parent.parent?.left;
      if (uncle && uncle.color === RED) {
        node.parent.color = BLACK;
        uncle.color = BLACK;
        node.parent.parent.color = RED;
        steps.push({ tree: cloneTree(root), msg: `corrigirInsercao Caso 1: tio vermelho → recolorir`, highlight: key, type: "recolor", func: "corrigirInsercao" });
        node = node.parent.parent;
      } else {
        if (node === node.parent.left) {
          node = node.parent;
          root = rightRotate(root, node);
          steps.push({ tree: cloneTree(root), msg: `rotacionarDireita: rotação à direita`, highlight: key, type: "rotate", func: "rotacionarDireita" });
        }
        node.parent.color = BLACK;
        if (node.parent.parent) node.parent.parent.color = RED;
        root = leftRotate(root, node.parent.parent);
        steps.push({ tree: cloneTree(root), msg: `rotacionarEsquerda + recolorir: Caso 3`, highlight: key, type: "rotate", func: "rotacionarEsquerda" });
      }
    }
  }
  root.color = BLACK;
  steps.push({ tree: cloneTree(root), msg: `Raiz marcada preta. Inserção completa ✓`, highlight: null, type: "done", func: "inserir" });
  return { root, steps };
}

function rbTransplant(root, u, v, uParent) {
  if (!uParent) root = v;
  else if (u === uParent.left) uParent.left = v;
  else uParent.right = v;
  if (v) v.parent = uParent;
  return root;
}

function rbDelete(root, key) {
  const steps = [];
  const z = findNode(root, key);
  if (!z) {
    steps.push({ tree: cloneTree(root), msg: `remover: chave ${key} não encontrada`, highlight: null, type: "notfound", func: "remover" });
    return { root, steps };
  }
  steps.push({ tree: cloneTree(root), msg: `remover: localizando nó ${key}`, highlight: key, type: "search", func: "remover" });

  let y = z;
  let yOriginalColor = y.color;
  let x, xParent;

  if (!z.left) {
    x = z.right;
    xParent = z.parent;
    root = rbTransplant(root, z, z.right, z.parent);
  } else if (!z.right) {
    x = z.left;
    xParent = z.parent;
    root = rbTransplant(root, z, z.left, z.parent);
  } else {
    y = minimum(z.right);
    yOriginalColor = y.color;
    x = y.right;
    if (y.parent === z) {
      xParent = y;
    } else {
      xParent = y.parent;
      root = rbTransplant(root, y, y.right, y.parent);
      y.right = z.right;
      if (y.right) y.right.parent = y;
    }
    root = rbTransplant(root, z, y, z.parent);
    y.left = z.left;
    if (y.left) y.left.parent = y;
    y.color = z.color;
  }

  steps.push({ tree: cloneTree(root), msg: `Nó ${key} removido da estrutura`, highlight: null, type: "delete", func: "remover" });

  if (yOriginalColor === BLACK) {
    let node = x;
    let parent = xParent;
    let guard = 0;
    while (node !== root && (!node || node.color === BLACK) && guard++ < 50) {
      if (!parent) break;
      if (node === parent.left) {
        let w = parent.right;
        if (w && w.color === RED) {
          w.color = BLACK;
          parent.color = RED;
          root = leftRotate(root, parent);
          steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 1: irmão vermelho → rotacionarEsquerda`, highlight: null, type: "rotate", func: "corrigirRemocao" });
          w = parent.right;
        }
        if ((!w || !w.left || w.left.color === BLACK) && (!w || !w.right || w.right.color === BLACK)) {
          if (w) w.color = RED;
          steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 2: recolorir irmão`, highlight: null, type: "recolor", func: "corrigirRemocao" });
          node = parent;
          parent = node.parent;
        } else {
          if (!w || !w.right || w.right.color === BLACK) {
            if (w && w.left) w.left.color = BLACK;
            if (w) w.color = RED;
            if (w) root = rightRotate(root, w);
            steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 3: rotacionarDireita no irmão`, highlight: null, type: "rotate", func: "corrigirRemocao" });
            w = parent.right;
          }
          if (w) w.color = parent.color;
          parent.color = BLACK;
          if (w && w.right) w.right.color = BLACK;
          root = leftRotate(root, parent);
          steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 4: rotacionarEsquerda no pai`, highlight: null, type: "rotate", func: "corrigirRemocao" });
          node = root;
          break;
        }
      } else {
        let w = parent.left;
        if (w && w.color === RED) {
          w.color = BLACK;
          parent.color = RED;
          root = rightRotate(root, parent);
          steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 1: irmão vermelho → rotacionarDireita`, highlight: null, type: "rotate", func: "corrigirRemocao" });
          w = parent.left;
        }
        if ((!w || !w.right || w.right.color === BLACK) && (!w || !w.left || w.left.color === BLACK)) {
          if (w) w.color = RED;
          steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 2: recolorir irmão`, highlight: null, type: "recolor", func: "corrigirRemocao" });
          node = parent;
          parent = node.parent;
        } else {
          if (!w || !w.left || w.left.color === BLACK) {
            if (w && w.right) w.right.color = BLACK;
            if (w) w.color = RED;
            if (w) root = leftRotate(root, w);
            steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 3: rotacionarEsquerda no irmão`, highlight: null, type: "rotate", func: "corrigirRemocao" });
            w = parent.left;
          }
          if (w) w.color = parent.color;
          parent.color = BLACK;
          if (w && w.left) w.left.color = BLACK;
          root = rightRotate(root, parent);
          steps.push({ tree: cloneTree(root), msg: `corrigirRemocao Caso 4: rotacionarDireita no pai`, highlight: null, type: "rotate", func: "corrigirRemocao" });
          node = root;
          break;
        }
      }
    }
    if (node) node.color = BLACK;
  }
  if (root) root.color = BLACK;
  steps.push({ tree: cloneTree(root), msg: `Remoção completa ✓`, highlight: null, type: "done", func: "remover" });
  return { root, steps };
}

function rbSearch(root, key) {
  const steps = [];
  let node = root;
  while (node) {
    steps.push({ tree: cloneTree(root), msg: `buscar: visitando ${node.key}, procurando ${key}`, highlight: node.key, type: "search", func: "buscar" });
    if (key === node.key) {
      steps.push({ tree: cloneTree(root), msg: `✓ Chave ${key} encontrada!`, highlight: key, type: "found", func: "buscar" });
      return { steps, found: true };
    }
    node = key < node.key ? node.left : node.right;
  }
  steps.push({ tree: cloneTree(root), msg: `✗ Chave ${key} não encontrada`, highlight: null, type: "notfound", func: "buscar" });
  return { steps, found: false };
}

// ─── Layout: in-order traversal guarantees zero overlap ───
// When showNil = true, NIL leaves are added as virtual nodes (small black squares)
function computeLayout(root, minWidth = 580, showNil = false) {
  if (!root) return { nodes: [], edges: [], width: minWidth, height: 200 };
  const nodeInfos = [];
  let counter = 0;
  let maxDepth = 0;

  function traverse(node, depth, parentId, side) {
    if (!node) {
      if (showNil && parentId !== null) {
        nodeInfos.push({
          isNil: true,
          nilId: `nil-${parentId}-${side}`,
          parentId,
          xIdx: counter++,
          depth,
        });
        if (depth > maxDepth) maxDepth = depth;
      }
      return;
    }
    traverse(node.left, depth + 1, node.id, "L");
    nodeInfos.push({ node, isNil: false, xIdx: counter++, depth });
    if (depth > maxDepth) maxDepth = depth;
    traverse(node.right, depth + 1, node.id, "R");
  }
  traverse(root, 0, null, null);

  const n = nodeInfos.length;
  const vSpacing = 72;
  const xSpacing = showNil ? 42 : 52;
  const sideMargin = 40;
  const width = Math.max(minWidth, (n - 1) * xSpacing + sideMargin * 2);
  const totalSpread = (n - 1) * xSpacing;
  const startX = (width - totalSpread) / 2;
  const height = 60 + (maxDepth + 1) * vSpacing;

  const realPosMap = new Map();
  const nilPosMap = new Map();
  const nodes = nodeInfos.map(info => {
    const x = startX + info.xIdx * xSpacing;
    const y = 44 + info.depth * vSpacing;
    if (info.isNil) {
      const pos = { isNil: true, nilId: info.nilId, parentId: info.parentId, x, y };
      nilPosMap.set(info.nilId, pos);
      return pos;
    } else {
      const pos = {
        isNil: false,
        key: info.node.key,
        color: info.node.color,
        id: info.node.id,
        x,
        y,
      };
      realPosMap.set(info.node.id, pos);
      return pos;
    }
  });

  // Edges: from each real node to its children (real or NIL)
  const edges = [];
  nodeInfos.filter(i => !i.isNil).forEach(({ node }) => {
    const myPos = realPosMap.get(node.id);
    if (!myPos) return;

    // Left
    if (node.left) {
      const lPos = realPosMap.get(node.left.id);
      if (lPos) edges.push({ x1: myPos.x, y1: myPos.y, x2: lPos.x, y2: lPos.y, toNil: false });
    } else if (showNil) {
      const lPos = nilPosMap.get(`nil-${node.id}-L`);
      if (lPos) edges.push({ x1: myPos.x, y1: myPos.y, x2: lPos.x, y2: lPos.y, toNil: true });
    }

    // Right
    if (node.right) {
      const rPos = realPosMap.get(node.right.id);
      if (rPos) edges.push({ x1: myPos.x, y1: myPos.y, x2: rPos.x, y2: rPos.y, toNil: false });
    } else if (showNil) {
      const rPos = nilPosMap.get(`nil-${node.id}-R`);
      if (rPos) edges.push({ x1: myPos.x, y1: myPos.y, x2: rPos.x, y2: rPos.y, toNil: true });
    }
  });

  return { nodes, edges, width, height };
}

function isValidRB(node) {
  if (!node) return { valid: true, bh: 1 };
  if (node.color === RED) {
    if ((node.left && node.left.color === RED) || (node.right && node.right.color === RED))
      return { valid: false, reason: `Nó ${node.key}: dois vermelhos consecutivos` };
  }
  const l = isValidRB(node.left);
  const r = isValidRB(node.right);
  if (!l.valid) return l;
  if (!r.valid) return r;
  if (l.bh !== r.bh) return { valid: false, reason: `Altura negra desigual em ${node.key}` };
  return { valid: true, bh: l.bh + (node.color === BLACK ? 1 : 0) };
}

function inorder(node) {
  if (!node) return [];
  return [...inorder(node.left), node.key, ...inorder(node.right)];
}

// ─── Real C Code with Portuguese identifiers ───
const C_CODE = {
  inserir: {
    name: "inserir",
    desc: "Insere uma chave na árvore",
    lines: [
      "void inserir(No** raiz, int chave) {",
      "    No* z = novoNo(chave);",
      "    z->cor = VERMELHO;",
      "",
      "    No* y = NULL;",
      "    No* x = *raiz;",
      "    while (x != NULL) {",
      "        y = x;",
      "        if (chave < x->chave)",
      "            x = x->esquerda;",
      "        else",
      "            x = x->direita;",
      "    }",
      "",
      "    z->pai = y;",
      "    if (y == NULL)",
      "        *raiz = z;",
      "    else if (chave < y->chave)",
      "        y->esquerda = z;",
      "    else",
      "        y->direita = z;",
      "",
      "    corrigirInsercao(raiz, z);",
      "}",
    ],
  },
  corrigirInsercao: {
    name: "corrigirInsercao",
    desc: "Restaura propriedades após inserção",
    lines: [
      "void corrigirInsercao(No** raiz, No* z) {",
      "    while (z->pai != NULL && z->pai->cor == VERMELHO) {",
      "        No* avo = z->pai->pai;",
      "",
      "        if (z->pai == avo->esquerda) {",
      "            No* tio = avo->direita;",
      "",
      "            if (tio != NULL && tio->cor == VERMELHO) {",
      "                /* Caso 1: tio vermelho */",
      "                z->pai->cor = PRETO;",
      "                tio->cor = PRETO;",
      "                avo->cor = VERMELHO;",
      "                z = avo;",
      "            } else {",
      "                if (z == z->pai->direita) {",
      "                    /* Caso 2 */",
      "                    z = z->pai;",
      "                    rotacionarEsquerda(raiz, z);",
      "                }",
      "                /* Caso 3 */",
      "                z->pai->cor = PRETO;",
      "                z->pai->pai->cor = VERMELHO;",
      "                rotacionarDireita(raiz, z->pai->pai);",
      "            }",
      "        } else {",
      "            /* simétrico ao lado direito */",
      "        }",
      "    }",
      "    (*raiz)->cor = PRETO;",
      "}",
    ],
  },
  rotacionarEsquerda: {
    name: "rotacionarEsquerda",
    desc: "Rotação à esquerda em torno de x",
    lines: [
      "void rotacionarEsquerda(No** raiz, No* x) {",
      "    No* y = x->direita;",
      "",
      "    x->direita = y->esquerda;",
      "    if (y->esquerda != NULL)",
      "        y->esquerda->pai = x;",
      "",
      "    y->pai = x->pai;",
      "    if (x->pai == NULL)",
      "        *raiz = y;",
      "    else if (x == x->pai->esquerda)",
      "        x->pai->esquerda = y;",
      "    else",
      "        x->pai->direita = y;",
      "",
      "    y->esquerda = x;",
      "    x->pai = y;",
      "}",
    ],
  },
  rotacionarDireita: {
    name: "rotacionarDireita",
    desc: "Rotação à direita em torno de y",
    lines: [
      "void rotacionarDireita(No** raiz, No* y) {",
      "    No* x = y->esquerda;",
      "",
      "    y->esquerda = x->direita;",
      "    if (x->direita != NULL)",
      "        x->direita->pai = y;",
      "",
      "    x->pai = y->pai;",
      "    if (y->pai == NULL)",
      "        *raiz = x;",
      "    else if (y == y->pai->direita)",
      "        y->pai->direita = x;",
      "    else",
      "        y->pai->esquerda = x;",
      "",
      "    x->direita = y;",
      "    y->pai = x;",
      "}",
    ],
  },
  remover: {
    name: "remover",
    desc: "Remove uma chave da árvore",
    lines: [
      "void remover(No** raiz, int chave) {",
      "    No* z = buscarNo(*raiz, chave);",
      "    if (z == NULL) return;",
      "",
      "    No* y = z;",
      "    Cor corOriginal = y->cor;",
      "    No* x;",
      "",
      "    if (z->esquerda == NULL) {",
      "        x = z->direita;",
      "        transplantar(raiz, z, z->direita);",
      "    } else if (z->direita == NULL) {",
      "        x = z->esquerda;",
      "        transplantar(raiz, z, z->esquerda);",
      "    } else {",
      "        y = minimo(z->direita);",
      "        corOriginal = y->cor;",
      "        x = y->direita;",
      "        if (y->pai != z) {",
      "            transplantar(raiz, y, y->direita);",
      "            y->direita = z->direita;",
      "            y->direita->pai = y;",
      "        }",
      "        transplantar(raiz, z, y);",
      "        y->esquerda = z->esquerda;",
      "        y->esquerda->pai = y;",
      "        y->cor = z->cor;",
      "    }",
      "",
      "    if (corOriginal == PRETO)",
      "        corrigirRemocao(raiz, x);",
      "",
      "    free(z);",
      "}",
    ],
  },
  corrigirRemocao: {
    name: "corrigirRemocao",
    desc: "Restaura propriedades após remoção",
    lines: [
      "void corrigirRemocao(No** raiz, No* x) {",
      "    while (x != *raiz && ehPreto(x)) {",
      "        if (x == x->pai->esquerda) {",
      "            No* w = x->pai->direita;",
      "",
      "            if (w->cor == VERMELHO) {",
      "                /* Caso 1 */",
      "                w->cor = PRETO;",
      "                x->pai->cor = VERMELHO;",
      "                rotacionarEsquerda(raiz, x->pai);",
      "                w = x->pai->direita;",
      "            }",
      "",
      "            if (ehPreto(w->esquerda) && ehPreto(w->direita)) {",
      "                /* Caso 2 */",
      "                w->cor = VERMELHO;",
      "                x = x->pai;",
      "            } else {",
      "                if (ehPreto(w->direita)) {",
      "                    /* Caso 3 */",
      "                    w->esquerda->cor = PRETO;",
      "                    w->cor = VERMELHO;",
      "                    rotacionarDireita(raiz, w);",
      "                    w = x->pai->direita;",
      "                }",
      "                /* Caso 4 */",
      "                w->cor = x->pai->cor;",
      "                x->pai->cor = PRETO;",
      "                w->direita->cor = PRETO;",
      "                rotacionarEsquerda(raiz, x->pai);",
      "                x = *raiz;",
      "            }",
      "        } else {",
      "            /* simétrico ao lado direito */",
      "        }",
      "    }",
      "    if (x != NULL) x->cor = PRETO;",
      "}",
    ],
  },
  buscar: {
    name: "buscar",
    desc: "Busca uma chave — O(log n)",
    lines: [
      "No* buscar(No* raiz, int chave) {",
      "    No* atual = raiz;",
      "",
      "    while (atual != NULL) {",
      "        if (chave == atual->chave)",
      "            return atual;",
      "",
      "        if (chave < atual->chave)",
      "            atual = atual->esquerda;",
      "        else",
      "            atual = atual->direita;",
      "    }",
      "",
      "    return NULL; /* não encontrado */",
      "}",
    ],
  },
};

const FUNC_ORDER = ["inserir", "corrigirInsercao", "rotacionarEsquerda", "rotacionarDireita", "remover", "corrigirRemocao", "buscar"];

// ─── Tree SVG ───
function TreeSVG({ root, highlight, animating, showNil = false }) {
  const layout = computeLayout(root, 580, showNil);

  if (!root) return (
    <div style={{ width: "100%", height: 380, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: 12, border: "1px dashed #d1d5db" }}>
      <div style={{ textAlign: "center", color: "#9ca3af" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🌱</div>
        <div style={{ fontSize: 13 }}>Árvore vazia — insira um valor para começar</div>
      </div>
    </div>
  );

  return (
    <div style={{ overflowX: "auto", overflowY: "hidden" }}>
      <svg width={layout.width} height={layout.height} style={{ display: "block" }}>
        <defs>
          <filter id="hl-glow"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fbbf24" floodOpacity="0.9" /></filter>
          <filter id="soft-shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" /></filter>
        </defs>
        {layout.edges.map((e, i) => (
          <line
            key={`e-${i}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={e.toNil ? "#9ca3af" : "#9ca3af"}
            strokeWidth={e.toNil ? 1.5 : 2}
            strokeDasharray={e.toNil ? "3 3" : "none"}
          />
        ))}
        {layout.nodes.map((n, i) => {
          if (n.isNil) {
            return (
              <g key={`nil-${n.nilId}`} style={{ animation: animating ? `nodeAppear 0.35s ease ${i * 0.025}s both` : undefined }}>
                <rect
                  x={n.x - 11}
                  y={n.y - 8}
                  width={22}
                  height={16}
                  rx={2}
                  fill="#1f2937"
                  stroke="#000"
                  strokeWidth={1}
                />
                <text
                  x={n.x}
                  y={n.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={8}
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing={0.5}
                >
                  NIL
                </text>
              </g>
            );
          }
          const isHL = highlight === n.key;
          const r = isHL ? 23 : 20;
          const fill = n.color === RED ? "#dc2626" : "#1f2937";
          const stroke = isHL ? "#fbbf24" : n.color === RED ? "#991b1b" : "#000";
          return (
            <g key={`n-${n.id}-${i}`} style={{ animation: animating ? `nodeAppear 0.35s ease ${i * 0.025}s both` : undefined }}>
              <circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={stroke} strokeWidth={isHL ? 3.5 : 2} filter={isHL ? "url(#hl-glow)" : "url(#soft-shadow)"} />
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={12} fontWeight="700" fontFamily="'JetBrains Mono', monospace">{n.key}</text>
            </g>
          );
        })}
        <style>{`@keyframes nodeAppear { from { opacity:0; transform: scale(0.5); } to { opacity:1; transform: scale(1); } }`}</style>
      </svg>
    </div>
  );
}

// ─── Main App ───
export default function RBTreeApp() {
  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", color: "#1f2937", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100vw; -webkit-text-size-adjust: 100%; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .btn-op { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s; color: white; }
        .btn-op:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.12); }
        .btn-op:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-insert { background: #3b82f6; }
        .btn-delete { background: #ef4444; }
        .btn-search { background: #10b981; }
        .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; padding: 9px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s; }
        .btn-secondary:hover { background: #f9fafb; border-color: #9ca3af; }
        /* CRITICAL: font-size must be >= 16px to prevent iOS Safari auto-zoom on focus */
        input[type="number"], input[type="text"] { background: white; border: 1.5px solid #d1d5db; color: #1f2937; padding: 10px 14px; border-radius: 8px; font-size: 16px; outline: none; font-family: 'JetBrains Mono', monospace; transition: border 0.2s; width: 120px; }
        input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
        .panel { background: white; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 0; }

        /* ─── Mobile / tablet ─── */
        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .code-panel {
            order: 2;
            position: static !important;
            top: auto !important;
          }
          .code-scroll {
            max-height: 360px !important;
          }
          .right-panel {
            order: 1;
          }
          .header-wrap {
            padding: 18px 14px 8px !important;
          }
          .header-title {
            font-size: 19px !important;
          }
          .header-sub {
            font-size: 11px !important;
          }
          .container-wrap {
            padding: 0 14px 28px !important;
          }
        }

        /* ─── Phone ─── */
        @media (max-width: 560px) {
          .controls-row {
            gap: 6px !important;
          }
          /* NOTE: font-size stays at 16px — anything smaller triggers iOS Safari auto-zoom on focus */
          .controls-row input {
            width: 100px !important;
            padding: 9px 10px !important;
          }
          .btn-op {
            padding: 9px 13px !important;
            font-size: 12px !important;
          }
          .btn-secondary {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .right-controls {
            width: 100%;
            margin-left: 0 !important;
            justify-content: space-between;
            border-top: 1px solid #f3f4f6;
            padding-top: 10px;
            margin-top: 4px;
          }
          .controls-panel {
            padding: 14px !important;
          }
          .tree-panel {
            padding: 14px !important;
          }
          .code-scroll {
            max-height: 300px !important;
            font-size: 11px !important;
          }
          .legend-panel {
            padding: 12px 14px !important;
            gap: 12px !important;
            font-size: 11px !important;
          }
          .info-panel {
            padding: 10px 14px !important;
            font-size: 11px !important;
          }
          .header-title {
            font-size: 17px !important;
          }
        }
      `}</style>

      <div className="header-wrap" style={{ padding: "24px 24px 20px", textAlign: "center" }}>
        <h1 className="header-title" style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
          Árvores Rubro-Negras <span style={{ color: "#dc2626" }}>·</span> Laboratório Interativo
        </h1>
        <p className="header-sub" style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Visualize o código C em execução enquanto a árvore se transforma</p>
      </div>

      <div className="container-wrap" style={{ padding: "0 24px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <MainLab />
      </div>
    </div>
  );
}

// ─── Main Lab ───
function MainLab() {
  const [root, setRoot] = useState(null);
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentFunc, setCurrentFunc] = useState(null);
  const [showNil, setShowNil] = useState(false);
  const timerRef = useRef(null);
  const funcRefs = useRef({});
  const codeScrollRef = useRef(null);

  const cur = steps[stepIdx];
  const displayTree = cur?.tree ?? root;

  useEffect(() => {
    if (cur?.func) {
      setCurrentFunc(cur.func);
      const el = funcRefs.current[cur.func];
      const container = codeScrollRef.current;
      if (el && container) {
        // Scroll ONLY the code container, never the whole page.
        // offsetTop is relative to the container (which has position: relative implicitly).
        const targetTop = el.offsetTop - 8;
        container.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    }
  }, [cur]);

  useEffect(() => {
    if (playing && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => setStepIdx(i => i + 1), 1100);
      return () => clearTimeout(timerRef.current);
    } else if (playing) {
      setPlaying(false);
    }
  }, [playing, stepIdx, steps]);

  const doInsert = () => {
    const val = parseInt(input);
    if (isNaN(val)) return;
    if (findNode(root, val)) {
      setSteps([{ tree: cloneTree(root), msg: `⚠️ Chave ${val} já existe`, highlight: val, type: "notfound", func: "inserir" }]);
      setStepIdx(0);
      setInput("");
      return;
    }
    const result = rbInsert(root ? cloneTree(root) : null, val);
    setSteps(result.steps);
    setStepIdx(0);
    setPlaying(true);
    setRoot(result.root);
    setInput("");
  };

  const doDelete = () => {
    const val = parseInt(input);
    if (isNaN(val) || !root) return;
    const result = rbDelete(cloneTree(root), val);
    setSteps(result.steps);
    setStepIdx(0);
    setPlaying(true);
    setRoot(result.root);
    setInput("");
  };

  const doSearch = () => {
    const val = parseInt(input);
    if (isNaN(val) || !root) return;
    const result = rbSearch(root, val);
    setSteps(result.steps);
    setStepIdx(0);
    setPlaying(true);
    setInput("");
  };

  const reset = () => {
    setRoot(null);
    setSteps([]);
    setStepIdx(0);
    setPlaying(false);
    setCurrentFunc(null);
  };

  const valid = isValidRB(root);
  const keyList = inorder(root);

  return (
    <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(360px, 480px) 1fr", gap: 20, alignItems: "start" }}>
      {/* Left: C Code Panel */}
      <div className="panel code-panel" style={{ padding: 0, overflow: "hidden", position: "sticky", top: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981" }} />
            </div>
            <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace", marginLeft: 8 }}>rbtree.c</span>
          </div>
          {currentFunc && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{currentFunc}()</span>
            </div>
          )}
        </div>

        <div ref={codeScrollRef} className="code-scroll" style={{ maxHeight: 680, overflowY: "auto", padding: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, position: "relative" }}>
          {FUNC_ORDER.map(fname => {
            const fn = C_CODE[fname];
            const isActive = currentFunc === fname;
            return (
              <div
                key={fname}
                ref={el => (funcRefs.current[fname] = el)}
                style={{
                  padding: "10px 0",
                  marginBottom: 8,
                  background: isActive ? "#fef3c7" : "transparent",
                  borderLeft: isActive ? "3px solid #f59e0b" : "3px solid transparent",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ padding: "0 18px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 10, color: isActive ? "#92400e" : "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {isActive ? "▶ " : ""}{fn.name}
                  </span>
                  <span style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic" }}>{fn.desc}</span>
                </div>
                {fn.lines.map((line, i) => (
                  <div key={i} style={{ padding: "1px 18px", display: "flex", gap: 12, color: isActive ? "#451a03" : "#374151", whiteSpace: "pre", lineHeight: 1.6 }}>
                    <span style={{ color: "#d1d5db", width: 18, textAlign: "right", userSelect: "none" }}>{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Interface */}
      <div className="right-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="panel controls-panel" style={{ padding: 18 }}>
          <div className="controls-row" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && doInsert()} placeholder="valor" />
            <button className="btn-op btn-insert" onClick={doInsert}>Inserir</button>
            <button className="btn-op btn-delete" onClick={doDelete} disabled={!root}>Deletar</button>
            <button className="btn-op btn-search" onClick={doSearch} disabled={!root}>Buscar</button>
            <div className="right-controls" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setShowNil(!showNil)}
                style={{
                  background: showNil ? "#1f2937" : "white",
                  color: showNil ? "white" : "#374151",
                  borderColor: showNil ? "#1f2937" : "#d1d5db",
                  fontSize: 12,
                }}
                title="Mostra as folhas NIL (sentinelas pretas)"
              >
                {showNil ? "✓ NIL visível" : "Mostrar NIL"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: valid.valid ? "#10b981" : "#ef4444" }} />
                <span style={{ fontSize: 11, color: valid.valid ? "#059669" : "#dc2626", fontWeight: 600 }}>
                  {valid.valid ? "Válida" : "Inválida"}
                </span>
              </div>
              <button className="btn-secondary" onClick={reset}>Limpar</button>
            </div>
          </div>
        </div>

        <div className="panel tree-panel" style={{ padding: 20, background: "#fafbfc" }}>
          <TreeSVG root={displayTree} highlight={cur?.highlight} animating={playing} showNil={showNil} />

          {cur && (
            <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, background: cur.type === "rotate" ? "#fef2f2" : cur.type === "recolor" ? "#fefce8" : cur.type === "found" ? "#f0fdf4" : cur.type === "notfound" ? "#fef2f2" : "#eff6ff", borderLeft: `4px solid ${cur.type === "rotate" ? "#dc2626" : cur.type === "recolor" ? "#f59e0b" : cur.type === "found" ? "#10b981" : cur.type === "notfound" ? "#ef4444" : "#3b82f6"}`, animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                {cur.func}() · Passo {stepIdx + 1}/{steps.length}
              </div>
              <p style={{ fontSize: 13, color: "#1f2937", fontWeight: 500 }}>{cur.msg}</p>
            </div>
          )}

          {steps.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn-secondary" onClick={() => { setStepIdx(0); setPlaying(false); }}>⏮</button>
              <button className="btn-secondary" onClick={() => { setStepIdx(Math.max(0, stepIdx - 1)); setPlaying(false); }} disabled={stepIdx === 0}>◀</button>
              <button className="btn-secondary" onClick={() => setPlaying(!playing)} style={{ minWidth: 90, background: playing ? "#dc2626" : "white", color: playing ? "white" : "#374151", borderColor: playing ? "#dc2626" : "#d1d5db" }}>
                {playing ? "⏸ Pausar" : "▶ Play"}
              </button>
              <button className="btn-secondary" onClick={() => { setStepIdx(Math.min(steps.length - 1, stepIdx + 1)); setPlaying(false); }} disabled={stepIdx === steps.length - 1}>▶</button>
              <button className="btn-secondary" onClick={() => { setStepIdx(steps.length - 1); setPlaying(false); }}>⏭</button>
            </div>
          )}
        </div>

        {root && (
          <div className="panel info-panel" style={{ padding: "12px 18px", display: "flex", gap: 20, fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
            <span><strong style={{ color: "#1f2937" }}>In-order:</strong> <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{keyList.join(", ")}</span></span>
            <span><strong style={{ color: "#1f2937" }}>Nós:</strong> {keyList.length}</span>
          </div>
        )}

        <div className="panel legend-panel" style={{ padding: "14px 18px", display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: "#4b5563" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#dc2626" }} /> Vermelho
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#1f2937" }} /> Preto
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 14, borderRadius: 2, background: "#1f2937", border: "1px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "white", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>NIL</div>
            Folha NIL <span style={{ color: "#9ca3af", fontStyle: "italic" }}>(sempre preta)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#dc2626", border: "3px solid #fbbf24" }} /> Em operação
          </div>
        </div>

        {showNil && (
          <div className="panel" style={{ padding: "12px 16px", background: "#fffbeb", borderColor: "#fde68a", borderLeft: "4px solid #f59e0b" }}>
            <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>
              <strong>Sobre as folhas NIL:</strong> Em árvores rubro-negras, "folha" significa o ponteiro <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 3, fontFamily: "'JetBrains Mono', monospace" }}>NULL</code> que vem após cada nó sem filhos — não o nó visível mais embaixo. As folhas NIL são <strong>sempre pretas</strong> por definição (Propriedade 3). Por isso um nó vermelho na base da árvore (com seus dois filhos NIL pretos) não viola nenhuma regra.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
