import assert from 'node:assert/strict'
import { test } from 'node:test'
import { IdleSession, IDLE_TIMEOUT_MS } from './idle-session'

function fixture(remaining = IDLE_TIMEOUT_MS) {
  let now = 1_000_000
  let expired = 0
  const reports: number[] = []
  const published: number[] = []
  const idle = new IdleSession(remaining, () => now, {
    expire: () => expired++, report: value => reports.push(value), publish: value => published.push(value),
  })
  return { idle, reports, published, advance: (ms: number) => { now += ms }, now: () => now, expired: () => expired }
}

test('idle sessions close at ten minutes, once, and interaction after suspension cannot revive them', () => {
  const f = fixture()
  f.advance(IDLE_TIMEOUT_MS - 1); f.idle.tick()
  assert.equal(f.expired(), 0)
  f.advance(1); f.idle.activity(); f.idle.tick()
  assert.equal(f.expired(), 1)
  assert.equal(f.reports.length, 0)
})

test('reload uses the remaining server deadline and polling never renews it', () => {
  const f = fixture(30_000)
  for (let i = 0; i < 30; i++) { f.advance(1000); f.idle.tick() }
  assert.equal(f.expired(), 1)
  assert.equal(f.reports.length, 0)
})

test('interaction extends the deadline, batches reports and flushes the last interaction without adding idle time', () => {
  const f = fixture()
  f.advance(1000); f.idle.activity()
  assert.deepEqual(f.reports, [0])
  f.advance(1000); f.idle.activity()
  assert.equal(f.reports.length, 1)
  f.advance(9000); f.idle.tick()
  assert.deepEqual(f.reports, [0, 9000])
  f.advance(IDLE_TIMEOUT_MS - 9001); f.idle.tick()
  assert.equal(f.expired(), 0)
  f.advance(1); f.idle.tick()
  assert.equal(f.expired(), 1)
})

test('activity in another tab extends the same session without echoing storage events', () => {
  const f = fixture()
  f.advance(300_000)
  f.idle.receive(f.now())
  assert.equal(f.published.length, 0)
  f.advance(300_000); f.idle.tick()
  assert.equal(f.expired(), 0)
  f.advance(300_000); f.idle.tick()
  assert.equal(f.expired(), 1)
  f.idle.receive(f.now())
  assert.equal(f.idle.check(), false)
})

test('invalid shared timestamps cannot keep a session alive', () => {
  const f = fixture()
  f.idle.receive(NaN); f.idle.receive(f.now() + 60_000)
  f.advance(IDLE_TIMEOUT_MS); f.idle.tick()
  assert.equal(f.expired(), 1)
})
