
type Task = (result: any) => any
type Tasks = Task[]
interface Queue extends Tasks {
  start: () => void
  retry: () => void
  restart: () => void
}
type State = 0 | 1 | 2 | 3 // 未开始|进行中|已完成|异常

export const createQueue = (tasks: any[], success = (result: any) => {}, fail = (err: Error) => { console.error(err) }) => {
  const todos = [...tasks]
  let point = 0
  let state: State = 0
  let result: any = undefined
  const queue: Queue = Object.assign([], {
    start: () => {
      if (state === 1) {
        console.warn('The queue is running.')
        return
      } else if (state === 2) {
        console.warn('The queue has ended. Please use restart.')
        return
      } else if (state === 3) {
        console.warn('The queue is abnormal. Please use retry or restart.')
        return
      }
      state = 1
      const execute = async () => {
        for(; point < todos.length; point++) {
          result = await todos[point](result)
        }
      }
      execute()
      .then(() => {
        state = 2
        success(result)
      })
      .catch((err) => {
        state = 3
        fail(err)
      })
    },
    retry: () => {
      if (state === 0) {
        console.warn('The queue did not start. Please use start.')
      } else if (state === 1) {
        console.warn('The queue is running.')
        return
      } else if (state === 2) {
        console.warn('The queue has no abnormal.')
      }
      state = 0
      queue.start()
    },
    restart: () => {
      point = 0
      state = 0
      result = undefined
      queue.start()
    }
  })
  tasks.forEach((task) => {
    if (typeof task === 'function') queue.push(task)
    else queue.push(() => task)
  })
  return new Proxy(queue, {
    set: () => false
  })
}