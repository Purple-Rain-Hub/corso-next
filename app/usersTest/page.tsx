import React from 'react'
import styles from './usersTest.module.css'



interface User {
  id: number
  name: string
  email: string
}

const UsersTest = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await res.json()
  console.log(users)

  return (
    <div className={styles.card}>
      <h1 className='text-2xl font-bold'>Users</h1>
      <p>{new Date().toLocaleTimeString()}</p>
      <hr />
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  )
}

export default UsersTest