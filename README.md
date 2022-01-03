# async-queue
基于Promise实现的同步任务队列。

## Installation
```shell
# Using npm:
npm install @zwj9297/async-queue

# Using yarn:
yarn add @zwj9297/async-queue
```

## API

### [createQueue(tasks, [success], [fail])](#createqueue)
创建一个同步任务队列的实例([QueueInstance](#queueinstance))，支持启动(start)，重启(restart)，重试(retry)。

> P.S: 创建后并不会马上执行该队列，需要调用start启动。

#### 参数
1. `tasks`(any[]): 任务队列，支持任意数据类型，若是Promise或输出Promise的函数，则会等待响应。上一个任务的响应结果会作为下一个任务的输入。
2. `[success]`(function): 成功回调，接收最后一个队列的响应作为参数。
3. `[fail]`(function): 失败回调。

#### 返回
(object): 同步任务队列实例

### start()
按顺序执行队列中的任务。执行完成后，会调用成功回调(success)，若有异常则调用失败回调(fail)。

### restart()
重置队列的状态，重新按顺序执行队列中的任务。

### retry()
从异常的任务开始重新执行队列中的任务。

## 接口声明
### createQueue
```typescript
interface createQueue {
  (this: undefined, tasks: any[], success?: (result: any) => void, fail?: (err: Error) => void): QueueInstance
}
```
### QueueInstance
```typescript
interface QueueInstance {
  [key as number]: any // 任务队列
  point: number // 队列指针：当前执行任务的下标
  state: 0|1|2|3 // 队列状态：未开始|进行中|已完成|异常
  start: () => void // 开始执行：只有 state === 0 时可以调用该函数
  restart: () => void // 重新开始执行：只有 state !== 0 时可以调用该函数
  retry: () => void // 重试：只有队列 state === 3 时可以调用该函数
}
```


## Example
```javascript
import { createQueue } from '@zwj9297/sync-queue'

const queue = createQueue(
  [
    () => {
      return new Promise((resolve) => {
        constole.log('step 1')
        resolve(1)
      })
    },
    (res) => {
      return new Promise((resolve) => {
        constole.log('step 2')
        resolve(res + 1)
      })
    },
    (res) => {
      return new Promise((resolve) => {
        constole.log('step 3')
        resolve(res + 1)
      })
    }
  ],
  success: (result) => {
    console.log('success:', result)
  },
  fail: (err) => {
    console.error(err)
  }
)
```