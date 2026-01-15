import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface SnippetStore {
    snippets: Snippet[];
    addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSnippet: (id: string, updates: Partial<Snippet>) => void;
    deleteSnippet: (id: string) => void;
}

// Pre-built snippets for CP
const DEFAULT_SNIPPETS: Snippet[] = [
    {
        id: 'default-1',
        title: 'Dijkstra (Priority Queue)',
        description: 'Algoritmo de caminho mínimo usando heap. Complexidade: O((V+E) log V)',
        language: 'cpp',
        code: `#include <bits/stdc++.h>
using namespace std;

typedef pair<long long, int> pli;
const long long INF = 1e18;

vector<long long> dijkstra(int start, vector<vector<pair<int, int>>>& adj) {
    int n = adj.size();
    vector<long long> dist(n, INF);
    priority_queue<pli, vector<pli>, greater<pli>> pq;
    
    dist[start] = 0;
    pq.push({0, start});
    
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        
        if (d > dist[u]) continue;
        
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
        category: 'Grafos',
        tags: ['graphs', 'shortest-path', 'dijkstra'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'default-2',
        title: 'Segment Tree (Point Update)',
        description: 'Segment Tree com atualização pontual e consulta de intervalo. Complexidade: O(log N)',
        language: 'cpp',
        code: `#include <bits/stdc++.h>
using namespace std;

template<typename T>
struct SegTree {
    int n;
    vector<T> tree;
    T identity = 0; // mude para o elemento neutro da operação
    
    T merge(T a, T b) { return a + b; } // mude para a operação desejada
    
    void build(vector<T>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
        } else {
            int mid = (start + end) / 2;
            build(arr, 2*node, start, mid);
            build(arr, 2*node+1, mid+1, end);
            tree[node] = merge(tree[2*node], tree[2*node+1]);
        }
    }
    
    void update(int node, int start, int end, int idx, T val) {
        if (start == end) {
            tree[node] = val;
        } else {
            int mid = (start + end) / 2;
            if (idx <= mid) update(2*node, start, mid, idx, val);
            else update(2*node+1, mid+1, end, idx, val);
            tree[node] = merge(tree[2*node], tree[2*node+1]);
        }
    }
    
    T query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return identity;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        return merge(query(2*node, start, mid, l, r),
                    query(2*node+1, mid+1, end, l, r));
    }
    
    SegTree(vector<T>& arr) {
        n = arr.size();
        tree.resize(4 * n);
        build(arr, 1, 0, n - 1);
    }
    
    void update(int idx, T val) { update(1, 0, n-1, idx, val); }
    T query(int l, int r) { return query(1, 0, n-1, l, r); }
};`,
        category: 'Estruturas de Dados',
        tags: ['segment-tree', 'data-structure', 'range-query'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'default-3',
        title: 'Binary Search (Lower/Upper Bound)',
        description: 'Busca binária para encontrar limites. Útil para encontrar posições em arrays ordenados.',
        language: 'cpp',
        code: `#include <bits/stdc++.h>
using namespace std;

// Primeiro índice onde arr[i] >= target
int lowerBound(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// Primeiro índice onde arr[i] > target
int upperBound(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// Busca binária genérica na resposta
// bool check(int x) { ... } // retorna true se x é válido
int binarySearchAnswer(int lo, int hi) {
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        // if (check(mid)) hi = mid;  // para minimizar
        // else lo = mid + 1;
    }
    return lo;
}`,
        category: 'Algoritmos',
        tags: ['binary-search', 'searching'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'default-4',
        title: 'Union Find (DSU)',
        description: 'Disjoint Set Union com path compression e union by rank. Complexidade: O(α(n)) amortizado.',
        language: 'cpp',
        code: `#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, rank_;
    int components;
    
    DSU(int n) : parent(n), rank_(n, 0), components(n) {
        iota(parent.begin(), parent.end(), 0);
    }
    
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    
    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        
        if (rank_[px] < rank_[py]) swap(px, py);
        parent[py] = px;
        if (rank_[px] == rank_[py]) rank_[px]++;
        components--;
        return true;
    }
    
    bool connected(int x, int y) { return find(x) == find(y); }
    int getComponents() { return components; }
};`,
        category: 'Estruturas de Dados',
        tags: ['dsu', 'union-find', 'data-structure'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'default-5',
        title: 'BFS (Shortest Path Unweighted)',
        description: 'Busca em largura para grafos não ponderados. Complexidade: O(V + E)',
        language: 'cpp',
        code: `#include <bits/stdc++.h>
using namespace std;

vector<int> bfs(int start, vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> dist(n, -1);
    queue<int> q;
    
    dist[start] = 0;
    q.push(start);
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}

// Reconstruir caminho
vector<int> getPath(int start, int end, vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> dist(n, -1), parent(n, -1);
    queue<int> q;
    
    dist[start] = 0;
    q.push(start);
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                parent[v] = u;
                q.push(v);
            }
        }
    }
    
    if (dist[end] == -1) return {}; // sem caminho
    
    vector<int> path;
    for (int v = end; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    return path;
}`,
        category: 'Grafos',
        tags: ['bfs', 'graphs', 'shortest-path'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'default-6',
        title: 'Sieve of Eratosthenes',
        description: 'Crivo de Eratóstenes para encontrar todos os primos até N. Complexidade: O(N log log N)',
        language: 'cpp',
        code: `#include <bits/stdc++.h>
using namespace std;

vector<bool> sieve(int n) {
    vector<bool> is_prime(n + 1, true);
    is_prime[0] = is_prime[1] = false;
    
    for (int i = 2; i * i <= n; i++) {
        if (is_prime[i]) {
            for (int j = i * i; j <= n; j += i) {
                is_prime[j] = false;
            }
        }
    }
    return is_prime;
}

vector<int> getPrimes(int n) {
    auto is_prime = sieve(n);
    vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (is_prime[i]) primes.push_back(i);
    }
    return primes;
}

// Smallest Prime Factor (útil para fatoração rápida)
vector<int> spf(int n) {
    vector<int> sp(n + 1);
    iota(sp.begin(), sp.end(), 0);
    for (int i = 2; i * i <= n; i++) {
        if (sp[i] == i) { // i é primo
            for (int j = i * i; j <= n; j += i) {
                if (sp[j] == j) sp[j] = i;
            }
        }
    }
    return sp;
}`,
        category: 'Matemática',
        tags: ['math', 'primes', 'number-theory', 'sieve'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export const useSnippetStore = create<SnippetStore>()(
    persist(
        (set) => ({
            snippets: DEFAULT_SNIPPETS,

            addSnippet: (snippetData) => set((state) => ({
                snippets: [
                    ...state.snippets,
                    {
                        ...snippetData,
                        id: uuidv4(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            })),

            updateSnippet: (id, updates) => set((state) => ({
                snippets: state.snippets.map((s) =>
                    s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
                ),
            })),

            deleteSnippet: (id) => set((state) => ({
                snippets: state.snippets.filter((s) => s.id !== id),
            })),
        }),
        {
            name: 'upsolve-snippets',
        }
    )
);
