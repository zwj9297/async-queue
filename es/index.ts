
type Task = (result: any) => any
type Tasks = Task[]
type State = 0 | 1 | 2 | 3 // 未开始|进行中|已完成|异常

interface Queue extends Tasks {
  point: number
  state: State
  start: () => void
  retry: () => void
  restart: () => void
}

export const createQueue = (
  tasks: any[],
  success = (result: any) => {},
  fail = (err: Error) => { console.error(err) }
): Queue => {
  const todos = tasks.map((task) => {
    if (task?.constructor === Function) return task
    return () => task
  })
  const initPoint = 0
  const initState: State = 0
  let result: any = undefined
  const queue: Queue = Object.assign([], {
    point: initPoint,
    state: initState,
    start: () => {
      if (queue.state === 1) {
        console.warn('The queue is running.')
        return
      } else if (queue.state === 2) {
        console.warn('The queue has ended. Please use restart.')
        return
      } else if (queue.state === 3) {
        console.warn('The queue is abnormal. Please use retry or restart.')
        return
      }
      queue.state = 1
      const execute = async () => {
        for(; queue.point < todos.length; queue.point++) {
          result = await todos[queue.point](result)
        }
      }
      execute()
      .then(() => {
        queue.state = 2
        success(result)
      })
      .catch((err) => {
        queue.state = 3
        fail(err)
      })
    },
    retry: () => {
      if (queue.state === 0) {
        console.warn('The queue did not start. Please use start.')
      } else if (queue.state === 1) {
        console.warn('The queue is running.')
        return
      } else if (queue.state === 2) {
        console.warn('The queue has no abnormal.')
      }
      queue.state = initState
      queue.start()
    },
    restart: () => {
      queue.point = initPoint
      queue.state = initState
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