import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppTemplate } from '../templates/AppTemplate'
import { CreatePostForm } from '../organisms/CreatePostForm'
import { postService, type PostTag } from '../../services/post.service'

export function PublicarPage() {
  const navigate = useNavigate()
  const [tags, setTags] = useState<PostTag[]>([])

  useEffect(() => {
    postService.getTags().then(setTags).catch(() => {})
  }, [])

  async function handleSubmit(formData: FormData) {
    const post = await postService.createPost(formData)
    navigate(`/posts/${post.id}`)
  }

  return (
    <AppTemplate>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-6">Novo projeto</h1>
        <CreatePostForm
          availableTags={tags}
          onSubmit={handleSubmit}
          onDiscard={() => navigate('/feed')}
        />
      </div>
    </AppTemplate>
  )
}
