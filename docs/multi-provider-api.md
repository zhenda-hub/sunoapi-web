# 多 API 提供方架构文档

## 概述

本项目支持多个 Suno API 服务提供商，通过环境变量即可切换，无需修改代码。

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
├─────────────────────────────────────────────────────────────┤
│  VITE_API_PROVIDER                                          │
│  ├── 'acedata'  → AceDataCloudAdapter                       │
│  ├── 'default'  → Default format (sunoapi.org compatible)   │
│  └── (扩展)    → 未来可添加更多适配器                        │
└─────────────────────────────────────────────────────────────┘
```

## 支持的 API 提供商

### AceDataCloud

| 项目 | 配置 |
|------|------|
| **提供商** | AceDataCloud |
| **Base URL** | `https://api.acedata.cloud` |
| **文档** | [platform.acedata.cloud/documents/suno-audios-integration](https://platform.acedata.cloud/documents/suno-audios-integration) |
| **获取 API Key** | [platform.acedata.cloud/services/suno](https://platform.acedata.cloud/services/suno) |
| **支持模型** | chirp-v3, chirp-v3-5, chirp-v4, chirp-v4-5, chirp-v4-5-plus |
| **特点** | ✅ 运行稳定超过1年<br>✅ 新用户有免费额度<br>✅ 支持最新 Suno v5 |

**API 响应格式：**
```json
{
  "success": true,
  "task_id": "xxx-xxx-xxx",
  "data": [...]
}
```

### sunoapi.org (兼容格式)

| 项目 | 配置 |
|------|------|
| **提供商** | sunoapi.org 或兼容服务商 |
| **Base URL** | `https://api.sunoapi.org/api/v1` |
| **特点** | ⚠️ 需自行验证服务稳定性 |

**API 响应格式：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {...}
}
```

## 环境变量配置

### 使用 AceDataCloud

```env
VITE_API_BASE_URL=https://api.acedata.cloud
VITE_API_PROVIDER=acedata
VITE_POLL_INTERVAL=3000
```

### 使用 sunoapi.org

```env
VITE_API_BASE_URL=https://api.sunoapi.org/api/v1
VITE_API_PROVIDER=default
VITE_POLL_INTERVAL=3000
```

## 添加新的 API 提供商

### 步骤

1. **创建新的适配器类**

在 `src/api/suno-api.ts` 中添加：

```typescript
class NewProviderAdapter {
  async generateMusic(params: GenerateMusicRequest): Promise<string> {
    // 实现生成音乐的逻辑
  }

  async generateLyrics(params: GenerateLyricsRequest): Promise<string> {
    // 实现生成歌词的逻辑
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    // 实现查询任务状态的逻辑
  }

  async getCredits(): Promise<number> {
    // 实现获取积分的逻辑
  }
}
```

2. **在 SunoApi 类中添加路由**

```typescript
async generateMusic(params: GenerateMusicRequest): Promise<string> {
  if (API_PROVIDER === 'acedata') {
    return this.acedataAdapter.generateMusic(params)
  }
  if (API_PROVIDER === 'newprovider') {
    return this.newProviderAdapter.generateMusic(params)
  }
  // 默认
  return ...
}
```

3. **更新 .env.example**

添加新提供商的配置示例。

## 代码结构

```
src/api/
├── client.ts           # Axios 客户端配置
├── types.ts            # TypeScript 类型定义
├── suno-api.ts         # 主 API 类 + 适配器
└── README.md           # API 模块说明
```

## 适配器接口

所有适配器必须实现以下方法：

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `generateMusic(params)` | `Promise<string>` | 生成音乐，返回 taskId |
| `generateLyrics(params)` | `Promise<string>` | 生成歌词，返回 taskId |
| `getTaskStatus(taskId)` | `Promise<TaskStatusResponse>` | 查询任务状态 |
| `getCredits()` | `Promise<number>` | 获取剩余积分 |

## 相关文件

| 文件 | 作用 |
|------|------|
| `.env` | 本地环境配置 |
| `.env.example` | 环境配置模板 |
| `src/api/suno-api.ts` | API 适配器实现 |
| `src/views/Settings.vue` | 设置页面 UI |

## 参考资料

- [AceDataCloud Suno API 文档](https://platform.acedata.cloud/documents/suno-audios-integration)
- [Suno V5 API 介绍](https://blog.csdn.net/cqcre/article/details/152287014)
- [稳定又便宜的 Suno API](https://juejin.cn/post/7596153767873282082)
