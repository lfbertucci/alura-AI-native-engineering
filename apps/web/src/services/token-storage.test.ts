import { beforeEach, describe, expect, it } from 'vitest'
import { clearToken, getToken, setToken } from './token-storage'

const KEY = 'auth_token'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('setToken with remember=true', () => {
  it('saves token to localStorage', () => {
    setToken('tok', true)
    expect(localStorage.getItem(KEY)).toBe('tok')
  })

  it('removes token from sessionStorage', () => {
    sessionStorage.setItem(KEY, 'old')
    setToken('tok', true)
    expect(sessionStorage.getItem(KEY)).toBeNull()
  })
})

describe('setToken with remember=false', () => {
  it('saves token to sessionStorage', () => {
    setToken('tok', false)
    expect(sessionStorage.getItem(KEY)).toBe('tok')
  })

  it('removes token from localStorage', () => {
    localStorage.setItem(KEY, 'old')
    setToken('tok', false)
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})

describe('getToken', () => {
  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull()
  })

  it('returns token from localStorage', () => {
    localStorage.setItem(KEY, 'lsToken')
    expect(getToken()).toBe('lsToken')
  })

  it('returns token from sessionStorage when localStorage is empty', () => {
    sessionStorage.setItem(KEY, 'ssToken')
    expect(getToken()).toBe('ssToken')
  })

  it('prefers localStorage over sessionStorage', () => {
    localStorage.setItem(KEY, 'lsToken')
    sessionStorage.setItem(KEY, 'ssToken')
    expect(getToken()).toBe('lsToken')
  })
})

describe('clearToken', () => {
  it('removes token from both storages', () => {
    localStorage.setItem(KEY, 'ls')
    sessionStorage.setItem(KEY, 'ss')
    clearToken()
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(sessionStorage.getItem(KEY)).toBeNull()
  })
})
