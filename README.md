# Codigo

Codigo 鏄竴涓熀浜?pnpm workspace + turbo 鐨勪綆浠ｇ爜骞冲彴 Monorepo銆備粨搴撳皢鍗忚灞傘€佽繍琛屾椂鐗╂枡銆佺紪杈戝櫒銆佸彂甯冪銆佹湇鍔＄涓庡祵鍏ュ紡 IDE 鎷嗗垎涓烘竻鏅拌竟鐣岋紝閬垮厤鍙屾簮瀹氫箟涓庡寘杈圭晫婕傜Щ銆?

## 鐩綍缁撴瀯

```text
codigo/
├─ apps/
│  ├─ client/   # 主前端（编辑器/项目工作台/预览入口）
│  ├─ admin/    # 后台管理前端
│  ├─ server/   # NestJS 后端
│  └─ ide/      # OpenSumi IDE 外壳
├─ packages/
│  ├─ schema/         # 跨端协议与类型（唯一事实源）
│  ├─ materials/      # 运行时物料渲染与注册（唯一事实源）
│  ├─ runtime-core/   # 框架无关运行时算法（纯函数）
│  ├─ render/         # 代码生成与 runtime-core 桥接
│  ├─ editor-sandbox/ # 编辑器沙箱输出与最小预览生成
│  ├─ file-service/   # IDE/浏览器文件服务上下文适配
│  ├─ plugin-system/  # 组件插件注册协议
│  └─ release/        # 最终发布页运行时（消费层）
└─ .trae/rules/  # 本地协作规则（不参与生产构建）
```

## 鐜瑕佹眰

- **Node.js**: 20.19+ 鎴?22.12+锛圴ite 7 闇€瑕侊級
- **pnpm**: 10.28.2+
- **鏁版嵁搴?*: MySQL 8.0+
- **缂撳瓨**: Redis 6.0+

## 蹇€熷紑濮?

### 1. 瀹夎渚濊禆

```bash
pnpm install
```

### 2. 閰嶇疆鏁版嵁搴?

#### 鏂瑰紡涓€锛氭湰鍦?Docker 鍚姩锛堟帹鑽愶級

```bash
# 鍚姩 MySQL
docker run -d --name codigo-mysql \
  -p 13306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=codigo_lowcode \
  mysql:8

# 鍚姩 Redis
docker run -d --name codigo-redis \
  -p 6379:6379 \
  redis:alpine
```

鐒跺悗淇敼鏁版嵁搴撻厤缃細

**apps/server/src/config/index.ts**
```typescript
export const redisConfig: RedisOptions = {
  host: 'localhost',
  port: 6379,
};
```

**apps/server/src/database/typeorm.config.ts**
```typescript
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 13306,
  username: 'root',
  password: '123456',
  database: 'codigo_lowcode',
  // ...
};
```

#### 鏂瑰紡浜岋細杩滅▼鏁版嵁搴擄紙铏氭嫙鏈?NAS锛?

濡傛灉鏁版嵁搴撹繍琛屽湪铏氭嫙鏈烘垨鍙︿竴鍙扮數鑴戜笂锛?

1. **铏氭嫙鏈轰娇鐢ㄦˉ鎺ョ綉缁?*锛氳櫄鎷熸満灏嗚幏寰楀拰涓绘満鍚屼竴缃戞鐨?IP锛岀洿鎺ヤ慨鏀归厤缃腑鐨?host 涓鸿櫄鎷熸満 IP

2. **铏氭嫙鏈轰娇鐢?NAT + 绔彛杞彂**锛?
   - VMware: 铏氭嫙鏈鸿缃?鈫?缃戠粶閫傞厤鍣?鈫?NAT 妯″紡 鈫?楂樼骇 鈫?绔彛杞彂
   - VirtualBox: 璁剧疆 鈫?缃戠粶 鈫?楂樼骇 鈫?绔彛杞彂
   
   娣诲姞瑙勫垯锛?
   | 涓绘満绔彛 | 绫诲瀷 | 铏氭嫙鏈虹鍙?|
   |---------|------|-----------|
   | 13306   | TCP  | 13306     |
   | 6379    | TCP  | 6379      |
   
   閰嶇疆涓娇鐢?`host: 'localhost'` 閫氳繃绔彛杞彂璁块棶

### 3. 鍚姩寮€鍙戞湇鍔″櫒

#### 鍏ㄩ儴鍚姩锛堥渶瑕佹暟鎹簱锛?

```bash
pnpm run dev
```

#### 鍗曠嫭鍚姩搴旂敤

```bash
# 鍙惎鍔ㄥ墠绔紙涓嶉渶瑕佹暟鎹簱锛?
pnpm run run:client

# 鍚姩鍏朵粬搴旂敤
pnpm run run:admin      # 鍚庡彴绠＄悊
pnpm run run:server     # 鍚庣鏈嶅姟锛堥渶瑕佹暟鎹簱锛?
pnpm run run:ide        # OpenSumi IDE
pnpm run run:release    # 鍙戝竷绔?
```

### 4. 璁块棶搴旂敤

| 搴旂敤 | 鍦板潃 |
|------|------|
| Client | http://localhost:5173/ |
| Admin | http://localhost:5174/ |
| Server API | http://localhost:3000/ |
| OpenSumi IDE | http://localhost:8080/ |
| Release | http://localhost:3001/ |

## 甯歌闂

### 1. Vite 鎶ラ敊 `crypto.hash is not a function`

**鍘熷洜**: Node.js 鐗堟湰杩囦綆锛堥渶瑕?20.19+锛?

**瑙ｅ喅**:
```bash
# 浣跨敤 nvm 鍒囨崲鐗堟湰
nvm use 20
# 鎴?
nvm use 22
```

### 2. 娴忚鍣ㄦ姤閿?`SyntaxError: Unexpected token '-'`

**鍘熷洜**: Vite 棰勬瀯寤虹紦瀛樻崯鍧?

**瑙ｅ喅**:
```bash
rm -rf node_modules/.vite
rm -rf apps/client/node_modules/.vite
pnpm run run:client
```

### 3. 鍚庣鎶ラ敊 `Unable to connect to the database`

**鍘熷洜**: 鏁版嵁搴撹繛鎺ュけ璐?

**瑙ｅ喅**:
1. 妫€鏌?MySQL 鍜?Redis 鏄惁杩愯
2. 妫€鏌ラ厤缃腑鐨?host銆乸ort銆佸瘑鐮佹槸鍚︽纭?
3. 妫€鏌ョ綉缁滆繛鎺ワ紙铏氭嫙鏈洪渶瑕侀厤缃鍙ｈ浆鍙戞垨妗ユ帴锛?

### 4. 绔彛琚崰鐢?

Vite 浼氳嚜鍔ㄥ皾璇曚笅涓€涓彲鐢ㄧ鍙ｏ紙5173 鈫?5174 鈫?5175...锛夛紝鏌ョ湅鎺у埗鍙拌緭鍑虹‘璁ゅ疄闄呯鍙ｃ€?

## 鏋勫缓涓庤川閲?

```bash
# 鏋勫缓鎵€鏈夊寘
pnpm run build

# 浠ｇ爜妫€鏌?
pnpm run lint

# 绫诲瀷妫€鏌?
pnpm run typecheck

# 杩愯娴嬭瘯
pnpm run test

# 鏋勫缓鐗瑰畾搴旂敤
pnpm run build:client
pnpm run build:server
pnpm run build:admin
```

## 鍗忎綔瑙勫垯

- 鏋舵瀯杈圭晫涓庝緷璧栨柟鍚戯細瑙?`.trae/rules/BASIC_RULES.md`
- 鍗忎綔涓庨鏍肩害鏉燂細瑙?`.trae/rules/USER_GUIDE.md`
- 椤圭洰鍖呬笌鐩綍鑱岃矗锛氳 `.trae/rules/ARTCH.md`

## 鐮斿彂宸ヤ綔鏃ュ織

浠撳簱鍐呯疆浠诲姟鏃ュ織绯荤粺锛屼换鍔＄粨鏉熷墠闇€瑕佺敓鎴愪竴浠藉伐浣滄棩蹇楋細

```bash
pnpm run task:log -- --title "浠诲姟鏍囬" --goal "浠诲姟鐩爣" --summary "浜や粯缁撴灉" --repro "澶嶇幇姝ラ 1"
```

鏃ュ織褰掓。鐩綍锛歚.trae/task-logs/`

