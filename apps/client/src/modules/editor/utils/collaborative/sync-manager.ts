// /**
//  * 跨标签页同步管理器
//  * 使用 BroadcastChannel API 实现多标签页实时同步
//  */

// class SyncManager {
//   constructor(channelName = 'collaborative-table-sync') {
//     this.channel = null
//     this.channelName = channelName
//     this.listeners = new Map()
//     this.instanceId = 'tab_' + Math.random().toString(36).substr(2, 9)
    
//     this.init()
//   }

//   init() {
//     if (typeof BroadcastChannel !== 'undefined') {
//       this.channel = new BroadcastChannel(this.channelName)
//       this.channel.onmessage = (event) => {
//         this.handleMessage(event.data)
//       }
//       console.log(`[SyncManager] 初始化成功，实例 ID: ${this.instanceId}`)
      
//       // 广播自己上线
//       this.broadcast({
//         type: 'user_online',
//         instanceId: this.instanceId,
//         timestamp: Date.now()
//       })
//     } else {
//       console.warn('[SyncManager] 浏览器不支持 BroadcastChannel API')
//     }
//   }

//   /**
//    * 广播消息到其他标签页
//    */
//   broadcast(data) {
//     if (this.channel) {
//       try {
//         const message = {
//           ...data,
//           fromInstance: this.instanceId,
//           timestamp: Date.now()
//         }
//         // 使用 JSON 序列化确保数据可克隆
//         this.channel.postMessage(JSON.parse(JSON.stringify(message)))
//       } catch (error) {
//         console.error('[SyncManager] 广播消息失败:', error, data)
//       }
//     }
//   }

//   /**
//    * 处理接收到的消息
//    */
//   handleMessage(data) {
//     // 忽略自己发送的消息
//     if (data.fromInstance === this.instanceId) {
//       return
//     }

//     const listeners = this.listeners.get(data.type) || []
//     listeners.forEach(callback => {
//       try {
//         callback(data)
//       } catch (error) {
//         console.error('[SyncManager] 消息处理错误:', error)
//       }
//     })
//   }

//   /**
//    * 注册消息监听器
//    */
//   on(type, callback) {
//     if (!this.listeners.has(type)) {
//       this.listeners.set(type, [])
//     }
//     this.listeners.get(type).push(callback)
//   }

//   /**
//    * 移除消息监听器
//    */
//   off(type, callback) {
//     const listeners = this.listeners.get(type) || []
//     const index = listeners.indexOf(callback)
//     if (index > -1) {
//       listeners.splice(index, 1)
//     }
//   }

//   /**
//    * 销毁同步管理器
//    */
//   destroy() {
//     if (this.channel) {
//       // 广播自己下线
//       this.broadcast({
//         type: 'user_offline',
//         instanceId: this.instanceId
//       })
      
//       this.channel.close()
//       this.channel = null
//     }
//     this.listeners.clear()
//     console.log(`[SyncManager] 已销毁，实例 ID: ${this.instanceId}`)
//   }

//   /**
//    * 请求同步数据
//    */
//   requestSync() {
//     this.broadcast({
//       type: 'sync_request',
//       instanceId: this.instanceId
//     })
//   }

//   /**
//    * 响应同步请求
//    */
//   respondSync(data) {
//     this.broadcast({
//       type: 'sync_response',
//       data: data
//     })
//   }
// }

// export default SyncManager
