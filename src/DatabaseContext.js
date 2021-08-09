import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { db, Timestamp } from './firebase'
import { useAuth } from './AuthContext'

const DatabaseContext = createContext()

export function useDatabase() {
  return useContext(DatabaseContext)
}

export function DatabaseProvider({ children }) {

  const { currentUser, currentUserDataExists } = useAuth()
  const [posts, setPosts] = useState({})
  const [postComments, setPostComments] = useState({})
  const [profiles, setProfiles] = useState({})
  const [loadingInitials, setLoadingInitials] = useState(true)
  const lastPost = useRef()
  const noMorePosts = useRef(false)
  const loadingMorePosts = useRef(false)

  const updateProfileDetails = async (userId, userDetails) => {
    try {
      var ref = db.collection('users').doc(userId)
      var { exists } = await ref.get()
      if (exists)
        await ref.update(userDetails)
      else
        await ref.set(userDetails)
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
    profileObj[userId] = { ...profileData, userId: userId }
    setProfiles(prevProfiles => ({ ...prevProfiles, ...profileObj }))
  }

  const loadProfile = async (userId) => {
    try {
      var userData = (await db.collection('users').doc(userId).get()).data()

      if (!userData) {
        console.log('User data not available')
        return
      }
    }
    catch (err) {
      console.log('Error loading profile details of user id:', userId)
      throw err
    }

    var newUserObj = {}
    newUserObj[userId] = { ...userData, userId: userId }
    setProfiles(prevProfiles => ({ ...prevProfiles, ...newUserObj }))
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
      viewers: new Set(),
      flaggers: new Set(),
      sharers: new Set()
    }
    setPosts(prevPosts => ({ ...prevPosts, ...newPostObj }))
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
    setPosts(prevPosts => ({ ...prevPosts, ...newPostObj }))

    try {
      // Add a 'shared' event to the original post
      await db.collection('posts').doc(orgPostId).collection('events')
        .add({
          type: 'shared',
          orgPostId: orgPostId,
          throughPostId: currentPostId,
          newPostId: newPostData.postId,
          sharer: currentUser.uid,
          timestamp: newPostData.createdAt
        })
    }
    catch (err) {
      console.log('Error updating shares of original post')
      throw new Error('Couldn\'t add share event')
    }

    // Update sharers set of original post in the posts state variable
    var postObj = {}
    postObj[orgPostId] = Object.assign({}, posts[orgPostId])
    postObj[orgPostId].sharers.add(currentUser.uid)
    setPosts(prevPosts => ({ ...prevPosts, ...postObj }))
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

    // Update viewers set of original post in the posts state variable
    var postObj = {}
    postObj[orgPostId] = Object.assign({}, posts[orgPostId])
    postObj[orgPostId].viewers.add(currentUser.uid)
    setPosts(prevPosts => ({ ...prevPosts, ...postObj }))
  }

  const toggleFlagPost = async (postId) => {
    var post = posts[postId]
    var orgPostId = post.orgPostId
    var currentPostId = post.postId

    try {
      var eventsRef = db.collection('posts').doc(orgPostId).collection('events')

      // Get the list of flags of original post by current user
      var { docs } = await eventsRef.where('type', '==', 'flagged').where('flagger', '==', currentUser.uid).get()

      var action

      if (docs.length > 0) {  // User had flagged the post earlier
        // Delete flag events by current user from firestore
        for (let i = 0; i < docs.length; i++) {
          await eventsRef.doc(docs[i].id).delete()
        }

        action = 'delete'
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

        action = 'add'
      }
    }
    catch (err) {
      console.log('Error toggling flag for the post', err.name, err.message)
      throw err
    }

    // Update flaggers set of original post in the posts state variable
    var postObj = {}
    postObj[orgPostId] = Object.assign({}, posts[orgPostId])
    if (action === 'add') postObj[orgPostId].flaggers.add(currentUser.uid)
    else if (action === 'delete') postObj[orgPostId].flaggers.delete(currentUser.uid)
    setPosts(prevPosts => ({ ...prevPosts, ...postObj }))
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
    var newPostComment = {
      ...newComment,
      timestamp: new Date(newComment.timestamp.seconds * 1000)
    }
    var newCommObj = {}
    newCommObj[postId] = postComments[postId] ?
      [newPostComment, ...postComments[postId]] :
      [newPostComment]
    setPostComments(prevPostComments => ({ ...prevPostComments, ...newCommObj }))
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
    setPostComments(prevPostComments => ({ ...prevPostComments, ...newCommObj }))
  }

  const loadPost = async (postId, postData) => {
    try {
      var postRef = db.collection('posts').doc(postId)
      var docData = postData || (await postRef.get()).data()

      if (!docData) {
        console.log('Post doesn\'t exist')
        return
      }

      // IMPORTANT: Load original post first before loading current post data
      if (docData.type === 'shared' && !posts[docData.orgPostId])
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
      if (!profiles[docData.creator])
        await loadProfile(docData.creator)
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
      newPostObj[postId].viewers = new Set(events.filter(a => a.data().type === 'viewed').map(a => a.data().viewer))
      newPostObj[postId].flaggers = new Set(events.filter(a => a.data().type === 'flagged').map(a => a.data().flagger))
      newPostObj[postId].sharers = new Set(events.filter(a => a.data().type === 'shared').map(a => a.data().sharer))
    }

    // Add to the posts state variable
    setPosts(prevPosts => ({ ...prevPosts, ...newPostObj }))
  }

  const loadPosts = async () => {
    if (loadingMorePosts.current === true) {
      console.log('currently loading posts. can\'t load more')
      return
    }
    if (noMorePosts.current === true) {
      console.log('No more posts')
      return
    }

    try {
      console.log('Loading more posts')

      loadingMorePosts.current = true

      var { docs } = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .startAfter(lastPost.current || '')
        .limit(6)
        .get()

      for (let i = 0; i < docs.length; i++) {
        if (!posts[docs[i].id])
          await loadPost(docs[i].id, docs[i].data())
      }

      lastPost.current = docs[docs.length - 1]
      if (docs.length === 0)
        noMorePosts.current = true
    }
    catch (err) {
      console.log('Couldn\'t load posts')
      throw err
    }
    finally {
      loadingMorePosts.current = false
    }
  }

  useEffect(() => {
    const loadInitials = async () => {
      setLoadingInitials(true)
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

    console.log('Trying to load')
    if (currentUserDataExists) {
      console.log('Loading initials...')

      // Load the required initials
      loadInitials()
    }
    else {
      // Reset the state variables
      setPosts({})
      setPostComments({})
      setProfiles({})
      setLoadingInitials(true)
      lastPost.current = undefined
      noMorePosts.current = false
      loadingMorePosts.current = false
    }
  }, [currentUserDataExists])

  return (
    <DatabaseContext.Provider value={{
      posts,
      postComments,
      profiles,
      loadingInitials,
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
