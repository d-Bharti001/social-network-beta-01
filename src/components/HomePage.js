import React from 'react'
import PostsList from './PostsList'
import PostCreateForm from './PostCreateForm'

function HomePage() {
  return (
    <div className='HomePage'>
      <PostsList />
      <PostCreateForm />
    </div>
  )
}

export default HomePage
