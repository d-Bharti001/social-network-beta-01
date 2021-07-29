import React, { createContext, useContext, useEffect, useState } from 'react'
import { db, Timestamp } from './firebase'
import { useAuth } from './AuthContext'

const DatabaseContext = createContext()

export function useDatabase() {
  return useContext(DatabaseContext)
}

export function DatabaseProvider({ children }) {

  const { currentUser } = useAuth()
  const [posts, setPosts] = useState({})
  const [postComments, setPostComments] = useState({})
  const [profiles, setProfiles] = useState({})
  const [loadingInitials, setLoadingInitials] = useState(true)
  const [lastPost, setLastPost] = useState()
  const [noMorePosts, setNoMorePosts] = useState(false)

  const updateProfileDetails = async (userId, userDetails) => {
    try {
      await db.collection('users').doc(userId).update(userDetails)
    }
    catch (err) {
      console.log('Error uploading user details to firestore')
      throw err
    }

    // Get currently stored profile data in the profiles state variable
    // and update with new details
    var profileData = Object.assign({}, profiles[userId])
    Object.assign(profileData, userDetails)
    var profileObj = {}
    profileObj[userId] = profileData
    setProfiles(Object.assign(profiles, profileObj))
  }

  const loadProfile = async (userId) => {
    try {
      var userData = (await db.collection('users').doc(userId).get()).data()
    }
    catch (err) {
      console.log('Error loading profile details of user id:', userId)
      throw err
    }

    var newUserObj = {}
    newUserObj[userId] = userData
    setProfiles(Object.assign(profiles, newUserObj))
  }

  const createPost = async (postContent) => {
    try {
      var newPostRef = db.collection('posts').doc()
      var newPostData = {
        type: 'original',
        content: postContent,
        createdAt: Timestamp.now(),
        creator: currentUser.uid,
        postId: newPostRef.id,
        orgPostId: newPostRef.id
      }

      // Upload new post data to firestore
      await newPostRef.set(newPostData)
    }
    catch (err) {
      console.log('Error creating new post', err.name, err.message)
      throw err
    }

    // Add new post to the posts state variable
    var newPostObj = {}
    newPostObj[newPostData.postId] = {
      ...newPostData,
      createdAt: new Date(newPostData.createdAt.seconds * 1000),
      views: 0,
      flags: 0,
      shares: 0
    }
    setPosts(Object.assign(posts, newPostObj))
  }

  const sharePost = async (postId) => {
    var oldPost = posts[postId]
    var orgPostId = oldPost.orgPostId
    var currentPostId = oldPost.postId

    try {
      var newPostRef = db.collection('posts').doc()

      // A shared post won't contain old post's content or attachments etc.
      var newPostData = {
        type: 'shared',
        createdAt: Timestamp.now(),
        creator: currentUser.uid,
        postId: newPostRef.id,
        orgPostId: orgPostId
      }

      // Upload new post data to firestore
      await newPostRef.set(newPostData)
    }
    catch (err) {
      console.log('Error sharing post', err.name, err.message)
      throw err
    }

    // Add new post to the posts state variable
    var newPostObj = {}
    newPostObj[newPostData.postId] = {
      ...newPostData,
      createdAt: new Date(newPostData.createdAt.seconds * 1000)
    }
    setPosts(Object.assign(posts, newPostObj))

    try {
      // Add a 'shared' event to the original post
      await db.collection('posts').doc(orgPostId).collection('events')
        .add({
          type: 'shared',
          orgPostId: orgPostId,
          throughPostId: currentPostId,
          sharer: currentUser.uid,
          timestamp: newPostData.createdAt
        })
    }
    catch (err) {
      console.log('Error updating shares of original post')
      throw new Error('Couldn\'t add share event')
    }

    try {
      // Get the updated list of share events of original post by current user
      var { docs } = await db.collection('posts').doc(orgPostId).collection('events')
        .where('type', '==', 'shared').where('sharer', '==', currentUser.uid).get()
    }
    catch (err) {
      console.log('Error fetching share count')
      throw new Error('Couldn\'t fetch share events')
    }

    // Update share counts of original post in posts state variable
    if (docs.length === 1) {
      // If the length is 1, that means this user has shared this post for the first time
      // so increment the share count
      var postObj = {}
      postObj[orgPostId] = Object.assign({}, posts[orgPostId])
      postObj[orgPostId].shares += 1
      setPosts(Object.assign(posts, postObj))
    }
  }

  const viewPost = async (postId) => {
    var post = posts[postId]
    var orgPostId = post.orgPostId
    var currentPostId = post.postId

    // Author of original post can't increment view count
    if (posts[orgPostId].creator === currentUser.uid)
      return

    try {
      var eventsRef = db.collection('posts').doc(orgPostId).collection('events')

      // Get the list of views of original post by current user
      var { docs } = await eventsRef.where('type', '==', 'viewed').where('viewer', '==', currentUser.uid).get()

      if (docs.length > 0) // User had viewed the post earlier
        return

      // Add a view event to firestore
      await eventsRef.add({
        type: 'viewed',
        orgPostId: orgPostId,
        throughPostId: currentPostId,
        viewer: currentUser.uid,
        timestamp: Timestamp.now()
      })
    }
    catch (err) {
      console.log('Error setting view for the post', err.name, err.message)
      throw err
    }

    // Increment view count of original post in posts state variable
    var postObj = {}
    postObj[orgPostId] = Object.assign({}, posts[orgPostId])
    postObj[orgPostId].views += 1
    setPosts(Object.assign(posts, postObj))
  }

  const toggleFlagPost = async (postId) => {
    var post = posts[postId]
    var orgPostId = post.orgPostId
    var currentPostId = post.postId

    try {
      var eventsRef = db.collection('posts').doc(orgPostId).collection('events')

      // Get the list of flags of original post by current user
      var { docs } = await eventsRef.where('type', '==', 'flagged').where('flagger', '==', currentUser.uid).get()

      if (docs.length > 0) {  // User had flagged the post earlier
        // Delete flag events by current user from firestore
        for (let i = 0; i < docs.length; i++) {
          await eventsRef.doc(docs[i].id).delete()
        }

        var inc = -1
      }
      else {
        // Add a flag event to firestore
        await eventsRef.add({
          type: 'flagged',
          orgPostId: orgPostId,
          throughPostId: currentPostId,
          flagger: currentUser.uid,
          timestamp: Timestamp.now()
        })

        var inc = 1
      }
    }
    catch (err) {
      console.log('Error toggling flag for the post', err.name, err.message)
      throw err
    }

    // Increment/decrement flag count of original post in posts state variable
    var postObj = {}
    postObj[orgPostId] = Object.assign({}, posts[orgPostId])
    postObj[orgPostId].flags += inc
    if (inc === 1) postObj[orgPostId].flaggedByCurrentUser = true
    else if (inc === -1) postObj[orgPostId].flaggedByCurrentUser = false
    setPosts(Object.assign(posts, postObj))
  }

  const commentPost = async (postId, comment) => {
    try {
      var newComment = {
        comment: comment,
        commenter: currentUser.uid,
        timestamp: Timestamp.now()
      }

      // Upload new comment to firestore
      await db.collection('posts').doc(postId).collection('comments').add(newComment)
    }
    catch (err) {
      console.log('Error commenting on post', err.name, err.message)
      throw err
    }

    // Add new comment to the postComments state variable
    var newCommObj = {}
    newCommObj[postId] = postComments[postId] ? [].push(postComments[postId]) : []
    newCommObj[postId].unshift(newComment)  // Add to the beginning of the list
    setPostComments(Object.assign(postComments, newCommObj))
  }

  const loadPostComments = async (postId) => {
    try {
      var { docs } = await db.collection('posts').doc(postId).collection('comments')
        .orderBy('timestamp', 'desc').get()
    }
    catch (err) {
      console.log('Error fetching comments of post with post id:', postId)
      throw err
    }

    try {
      // Load profile details of commenters
      for (let i = 0; i < docs.length; i++) {
        let { commenter } = docs[i].data()
        if (!profiles[commenter]) // Skip if profile data already loaded
          await loadProfile(commenter)
      }
    }
    catch (err) {
      console.log('Couldn\'t load profile details of commenter', err.name, err.message)
      throw err
    }

    var commentsList = []
    for (let i = 0; i < docs.length; i++) {
      commentsList.push({
        ...docs[i].data(),
        timestamp: new Date(docs[i].data().timestamp.seconds * 1000)
      })
    }
    var newCommObj = {}
    newCommObj[postId] = commentsList
    setPostComments(Object.assign(postComments, newCommObj))
  }

  const loadPost = async (postId, postData) => {
    try {
      var postRef = db.collection('posts').doc(postId)
      var docData = postData || (await postRef.get()).data()

      // IMPORTANT: Load original post first before loading current post data
      if (docData.type === 'shared')
        await loadPost(docData.orgPostId)

      else if (docData.type === 'original')
        var events = (await postRef.collection('events').get()).docs
    }
    catch (err) {
      console.log('Error fetching post with id', postId, err.name, err.message)
      throw err
    }

    try {
      // Load profile details of post's creator (if not already loaded)
      if (!profiles[newPostObj.creator])
        await loadProfile(newPostObj.creator)
    }
    catch (err) {
      throw err
    }

    // Create new post object to be added to posts state variable
    var newPostObj = {}
    newPostObj[postId] = {
      ...docData,
      createdAt: new Date(docData.createdAt.seconds * 1000)
    }

    if (docData.type === 'original') {

      // Set number of views
      newPostObj[postId].views = events.filter(a => a.data().type === 'viewed').length

      // Set number of flags
      newPostObj[postId].flags = events.filter(a => a.data().type === 'flagged').length

      // Set whether the post is flagged by current user
      newPostObj[postId].flaggedByCurrentUser = events.filter(a => a.data().type === 'flagged')
        .filter(a => a.data().flagger === currentUser.uid)
        .length ? true : false

      // Set number of shares
      newPostObj[postId].shares = new Set(events.filter(a => a.data().type === 'shared').map(a => a.data().sharer)).size
    }

    // Add to the posts state variable
    setPosts(Object.assign(posts, newPostObj))
  }

  const loadPosts = async () => {
    if (noMorePosts)
      return

    try {
      var { docs } = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .startAfter(lastPost || 0)
        .limit(6)
        .get()

      for (let i = 0; i < docs.length; i++) {
        if (!posts[docs[i].id])
          await loadPost(docs[i].id, docs[i].data())
      }
      setLastPost(docs[docs.length - 1])
      if (docs.length === 0)
        setNoMorePosts(true)
    }
    catch (err) {
      console.log('Couldn\'t load posts')
      throw err
    }
  }

  useEffect(() => {
    const loadInitials = async () => {
      try {
        // Load profile details of current user
        await loadProfile(currentUser.uid)
        // Load initial posts
        await loadPosts()
      }
      catch (err) {
        console.log('Error from useEffect of DatabaseContext')
        console.log(err.name, err.message)
      }
      // If no error occurred, convey that initials are loaded
      setLoadingInitials(false)
    }

    loadInitials()
  }, [])

  return (
    <DatabaseContext.Provider value={{
      posts,
      postComments,
      profiles,
      loadingInitials,
      lastPost,
      noMorePosts,
      updateProfileDetails,
      loadProfile,
      createPost,
      sharePost,
      viewPost,
      toggleFlagPost,
      commentPost,
      loadPostComments,
      loadPost,
      loadPosts,
    }}>
      {children}
    </DatabaseContext.Provider>
  )
}
