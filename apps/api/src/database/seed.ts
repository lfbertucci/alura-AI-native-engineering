import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'carreira_native_ai',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: false,
});

async function seed() {
  await ds.initialize();
  console.log('Seed: conectado ao banco de dados');

  const userRepo = ds.getRepository('users');
  const tagRepo = ds.getRepository('tags');
  const postRepo = ds.getRepository('posts');
  const commentRepo = ds.getRepository('comments');
  const likeRepo = ds.getRepository('post_likes');

  // Clear data (respecting FK order)
  await likeRepo.query('DELETE FROM post_likes');
  await commentRepo.query('DELETE FROM comments');
  await postRepo.query('DELETE FROM post_tags');
  await postRepo.query('DELETE FROM posts');
  await tagRepo.query('DELETE FROM tags');
  await userRepo.query(`DELETE FROM users WHERE email LIKE '%@codeconnect.dev'`);

  console.log('Seed: dados anteriores removidos');

  const hash = await bcrypt.hash('senha123', 10);

  const [julio, marcia, gabriel] = await userRepo.save([
    { name: 'Julio Carvalho', email: 'julio@codeconnect.dev', passwordHash: hash },
    { name: 'Márcia Silva', email: 'marcia@codeconnect.dev', passwordHash: hash },
    { name: 'Gabriel Luz', email: 'gabriel@codeconnect.dev', passwordHash: hash },
  ]);

  console.log('Seed: usuários criados');

  const tagNames = ['React', 'TypeScript', 'Node.js', 'Front-end', 'Acessibilidade', 'CSS', 'Python', 'JavaScript'];
  const tags: Record<string, { id: string; name: string }> = {};
  for (const name of tagNames) {
    const tag = (await tagRepo.save({ name })) as { id: string; name: string };
    tags[name] = tag;
  }

  console.log('Seed: tags criadas');

  const postsData = [
    {
      title: 'Hooks customizados em React',
      description: 'Aprenda a criar e usar hooks customizados para reutilizar lógica entre componentes. Uma das funcionalidades mais poderosas do React moderno.',
      code: `import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce`,
      thumbnailUrl: 'https://picsum.photos/seed/react-hooks/800/400',
      author: julio,
      tagList: ['React', 'TypeScript'],
    },
    {
      title: 'Padrão Singleton em TypeScript',
      description: 'O padrão Singleton garante que uma classe tenha apenas uma instância. Veja como implementá-lo de forma elegante com TypeScript.',
      code: `class Database {
  private static instance: Database

  private constructor(private readonly url: string) {}

  static getInstance(url: string): Database {
    if (!Database.instance) {
      Database.instance = new Database(url)
    }
    return Database.instance
  }

  connect() {
    console.log(\`Connecting to \${this.url}\`)
  }
}`,
      thumbnailUrl: null,
      author: julio,
      tagList: ['TypeScript'],
    },
    {
      title: 'API REST com Node.js e Express',
      description: 'Como construir uma API RESTful seguindo boas práticas de design, com autenticação JWT, validação de entrada e documentação com Swagger.',
      code: `import express from 'express'
import { z } from 'zod'

const app = express()
app.use(express.json())

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

app.post('/users', (req, res) => {
  const result = userSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(422).json({ errors: result.error.issues })
  }
  res.status(201).json({ id: crypto.randomUUID(), ...result.data })
})

app.listen(3000)`,
      thumbnailUrl: 'https://picsum.photos/seed/nodejs-api/800/400',
      author: marcia,
      tagList: ['Node.js', 'JavaScript'],
    },
    {
      title: 'Acessibilidade na Web: um guia prático',
      description: 'Dicas essenciais para tornar seus projetos acessíveis: uso correto de ARIA, semântica HTML, contraste de cores e navegação por teclado.',
      code: null,
      thumbnailUrl: null,
      author: gabriel,
      tagList: ['Acessibilidade', 'Front-end'],
    },
    {
      title: 'CSS Grid: layouts modernos sem frameworks',
      description: 'CSS Grid é poderoso o suficiente para criar layouts complexos sem precisar de frameworks como Bootstrap. Aprenda as propriedades essenciais.',
      code: `.grid-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
  gap: 0;
}

.sidebar { grid-area: sidebar; }
.header  { grid-area: header;  }
.main    { grid-area: main;    }`,
      thumbnailUrl: 'https://picsum.photos/seed/css-grid/800/400',
      author: marcia,
      tagList: ['CSS', 'Front-end'],
    },
    {
      title: 'Context API: gerenciamento de estado sem Redux',
      description: 'O Context API do React permite compartilhar estado global de forma simples. Veja quando usá-lo e quando preferir soluções como Zustand ou Redux.',
      code: `import { createContext, useContext, useState } from 'react'

interface AuthContextValue {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}`,
      thumbnailUrl: null,
      author: julio,
      tagList: ['React', 'TypeScript'],
    },
    {
      title: 'Python para automação de tarefas',
      description: 'Como usar Python para automatizar tarefas repetitivas: manipulação de arquivos, web scraping com BeautifulSoup e envio automático de e-mails.',
      code: `import pathlib
import shutil
from datetime import date

def organizar_downloads(pasta: str) -> None:
    extensoes = {
        '.pdf': 'Documentos',
        '.jpg': 'Imagens', '.png': 'Imagens',
        '.mp4': 'Videos', '.mkv': 'Videos',
        '.zip': 'Arquivos',
    }
    base = pathlib.Path(pasta)
    for arquivo in base.iterdir():
        if arquivo.is_file():
            destino = base / extensoes.get(arquivo.suffix, 'Outros')
            destino.mkdir(exist_ok=True)
            shutil.move(str(arquivo), destino / arquivo.name)

organizar_downloads('~/Downloads')`,
      thumbnailUrl: 'https://picsum.photos/seed/python-auto/800/400',
      author: gabriel,
      tagList: ['Python'],
    },
    {
      title: 'TypeScript avançado: tipos condicionais',
      description: 'Tipos condicionais do TypeScript permitem criar tipos que dependem de outros tipos. Um recurso poderoso para criar APIs type-safe.',
      code: `type NonNullable<T> = T extends null | undefined ? never : T

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Flatten<T> = T extends Array<infer U> ? U : T

// Uso prático: DeepReadonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K]
}`,
      thumbnailUrl: null,
      author: julio,
      tagList: ['TypeScript'],
    },
    {
      title: 'Performance em React: evitando re-renders',
      description: 'Técnicas para otimizar o desempenho de apps React: memo, useMemo, useCallback, lazy loading e profiling com React DevTools.',
      code: `import { memo, useMemo, useCallback } from 'react'

interface ListProps {
  items: string[]
  onSelect: (item: string) => void
}

const List = memo(({ items, onSelect }: ListProps) => {
  const sorted = useMemo(
    () => [...items].sort(),
    [items]
  )

  const handleClick = useCallback(
    (item: string) => () => onSelect(item),
    [onSelect]
  )

  return (
    <ul>
      {sorted.map(item => (
        <li key={item} onClick={handleClick(item)}>{item}</li>
      ))}
    </ul>
  )
})`,
      thumbnailUrl: 'https://picsum.photos/seed/react-perf/800/400',
      author: marcia,
      tagList: ['React', 'Front-end'],
    },
    {
      title: 'Boas práticas em JavaScript moderno',
      description: 'Um guia sobre as melhores práticas do JavaScript moderno: desestruturação, operador opcional, nullish coalescing, e módulos ES.',
      code: `// Desestruturação com renomeação e padrão
const { name: userName = 'Anônimo', age = 0 } = user ?? {}

// Optional chaining + nullish coalescing
const city = user?.address?.city ?? 'Não informada'

// Object.fromEntries para transformar arrays em objetos
const queryParams = Object.fromEntries(
  new URLSearchParams(window.location.search)
)

// Promise.allSettled para tratar erros individualmente
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(2),
  fetchUser(999),
])`,
      thumbnailUrl: null,
      author: gabriel,
      tagList: ['JavaScript', 'Front-end'],
    },
  ];

  const createdPosts: { id: string }[] = [];

  for (const p of postsData) {
    const tagEntities = p.tagList.map((n) => tags[n]);
    const post = await postRepo
      .createQueryBuilder()
      .insert()
      .into('posts')
      .values({
        title: p.title,
        description: p.description,
        code: p.code,
        thumbnailUrl: p.thumbnailUrl,
        authorId: p.author.id,
      })
      .returning('id')
      .execute();

    const postId = post.raw[0].id as string;
    createdPosts.push({ id: postId });

    for (const tag of tagEntities) {
      await ds.query('INSERT INTO post_tags ("postId", "tagId") VALUES ($1, $2)', [postId, tag.id]);
    }
  }

  console.log('Seed: posts criados');

  // Comments on first post
  const post1Id = createdPosts[0].id;
  const c1 = await commentRepo.save({
    content: 'Ótimo post! Hooks customizados salvaram muito tempo no meu projeto.',
    authorId: marcia.id,
    postId: post1Id,
    parentId: null,
  });
  await commentRepo.save({
    content: 'Concordo! Uso useDebounce em todo formulário de busca.',
    authorId: gabriel.id,
    postId: post1Id,
    parentId: c1.id,
  });
  await commentRepo.save({
    content: 'Valeu Márcia! 😄 Qualquer dúvida é só perguntar.',
    authorId: julio.id,
    postId: post1Id,
    parentId: c1.id,
  });

  const c2 = await commentRepo.save({
    content: 'Quanto tempo você levou para finalizar esse projeto?',
    authorId: gabriel.id,
    postId: post1Id,
    parentId: null,
  });
  await commentRepo.save({
    content: 'Uns 3 dias! React com TypeScript acelera bastante.',
    authorId: julio.id,
    postId: post1Id,
    parentId: c2.id,
  });

  // Comments on third post (API REST)
  const post3Id = createdPosts[2].id;
  await commentRepo.save({
    content: 'Excelente! Zod com Express é uma combinação muito poderosa.',
    authorId: julio.id,
    postId: post3Id,
    parentId: null,
  });

  console.log('Seed: comentários criados');

  // Likes
  const likeData = [
    { userId: marcia.id, postId: createdPosts[0].id },
    { userId: gabriel.id, postId: createdPosts[0].id },
    { userId: julio.id, postId: createdPosts[2].id },
    { userId: gabriel.id, postId: createdPosts[2].id },
    { userId: julio.id, postId: createdPosts[4].id },
    { userId: marcia.id, postId: createdPosts[6].id },
    { userId: julio.id, postId: createdPosts[8].id },
    { userId: gabriel.id, postId: createdPosts[8].id },
    { userId: marcia.id, postId: createdPosts[8].id },
  ];

  for (const l of likeData) {
    await likeRepo.save(l);
  }

  console.log('Seed: likes criados');

  await ds.destroy();
  console.log('✅ Seed concluído com sucesso!');
}

seed().catch((err) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});
