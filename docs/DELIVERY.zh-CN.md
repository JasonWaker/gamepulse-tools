# GamePulse Tools 交付说明 · v0.1.0

## 地址与版本

- 推广访问地址：https://jasonwaker.github.io/gamepulse-tools/
- 代码仓库：https://github.com/JasonWaker/gamepulse-tools
- 首版版本：v0.1.0。
- 本次按最新要求以 GitHub Pages 发布；Cloudflare 配置已预留，但未创建 Cloudflare 项目，因此没有实际签发的 pages.dev 地址。
- 每次后续发布必须增加版本号，写 CHANGELOG，提交新的 Git tag 和 GitHub Release。要求已写入项目 AGENTS.md。

## 技术架构与目录

Next.js 16.3.4 App Router、React 19.2.8、TypeScript、Tailwind 4、自定义响应式设计系统、静态导出。客户端负责计算，页面可由 CDN 托管。

- `src/app`：首页、发现页、专区、工具、数据库、实体页、政策页、SEO。
- `src/components`：统一组件、原创氛围图、工具交互、媒体展示和搜索。
- `src/lib/registry.ts`：游戏、工具、实体和主题配置。
- `src/lib/config.ts`：品牌、正式域名、版本、链接前缀。
- `src/lib/calculations.ts`：可独立测试的计算逻辑。
- `src/lib/media.ts`：素材登记、展示权限、Steam/Roblox 发现接口。
- `supabase/schema.sql` 与 `seed.sql`：数据库结构和初始数据。
- `scripts`：浏览器检查、本地素材审核、版本发布辅助。
- `.github/workflows/deploy.yml`：GitHub 自动检查和发布。
- `docs/verification`：实际截图和浏览器检查结果。

新增游戏主要修改 registry 中的数据与主题；工具按 tool_type 选择实现，不根据游戏名称复制页面。

## 已实现页面

首页、游戏发现、全部工具、编辑精选观察名单、三个游戏专区、各游戏工具列表、五个工具详情、数据库入口、武器/车辆/生物/道具/Pass 类别、八个 Aniimo 实体页、Codes、Guides、About、Privacy、404、加载和错误状态。

没有真实内容的数据库、Codes、Guides 页面及内容不足的实体详情设置 noindex，不进入 sitemap。

## 五个工具

1. WARDOGS 配装预算：五个装备槽、自定义装备价格、抽屉、搜索、分类、排序、实时余额、超预算警告。
2. WARDOGS 武器对比：双武器属性、横向数据条、条件满足后计算 TTK；公式与假设公开。
3. Aniimo 队伍规划：官方角色名称、四格个人规划、加入/移除、重复和容量限制。四格是工具规划容量，不宣称为官方队伍人数。
4. Agartha 进度规划：Height/Face/Frame/Bodyfat 个人目标完成度、实时进度环、最低完成度建议。Bodyfat 使用接近个人目标的百分比，并非体脂越高越好。
5. Agartha Pass 计算：当前/目标资源、实测每小时速率、自填倍率，计算预计时间和节省时间，不默认任何付费 Pass 效果或售价。

工具可保存到本机浏览器、重置、复制分享链接。分享链接直接包含输入，拥有链接的人可以查看；不上传个人计划。

## 数据库结构与权限

六张表：games、tools、game_entities、game_media、game_updates、tool_events。

保留趋势评分、机会评分、来源、优先级、主题、版本、验证日期等字段。所有表开启 RLS。匿名用户仅可读已发布内容及 approved/embed_only 素材，无写入权限；事件日志不对外开放。

SQL 已在嵌入式 PostgreSQL 中实际执行并测试权限。**没有向任何线上 Supabase 数据库执行修改，也没有建立新的 Supabase 云项目。** 当前公开内容来自版本控制内的静态 registry；连接云数据库属于下一阶段。

## 素材与来源

实际展示的是原创 CSS/SVG 地图线、能量球与几何山体，以及原创站点标志和 OG 分享图。它们标为 approved，明确不是游戏画面。

WARDOGS 官方图库和 Aniimo 官网素材仅记录来源，rights_status 为 review_required，未下载、未镜像、未展示。Lucide UI 图标使用其开源许可。

具体登记见 MEDIA.md 和 `/about` 页面。开发环境素材审核工具位于 `http://127.0.0.1:3101/admin/media`，启动方式 `npm run admin:media`，只监听本机，不随静态站上线。

## 尚缺真实数据

- WARDOGS：装备价、武器属性、载具属性、可靠的当前游戏版本。Steam 官方 API 已确认抢先体验计划于 2026-09-10 上线。
- Aniimo：已确认八个官方索引名称；类型、技能、属性克制与战斗数值待验证。
- Agartha：升级成本、资源产出公式、Pass 价格和倍率、有效 Codes 待验证。
- 全站：真实趋势/机会评分、官方可嵌入视频与明确授权图片。

未使用虚构演示数据充当生产游戏数据。计算工具依靠玩家自填数据可使用；缺失的官方计算和分析明确显示不可用。

## 环境变量与部署

`NEXT_PUBLIC_SITE_URL` 控制 canonical 域名；GitHub Pages 当前包含项目路径。`NEXT_PUBLIC_BASE_PATH=/gamepulse-tools` 控制资源和站内链接前缀。

可选：`NEXT_PUBLIC_GA_ID`、`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`。GA 未配置时不加载；配置后也需要访客同意。Supabase URL/public key 仅作后续接入预留，不能设置 service-role/secret key 为公开变量。

Cloudflare：连接仓库，Node 22，构建命令 `npm run build`，输出 `out`，将 SITE_URL 设置成实际 pages.dev 域名并清空 BASE_PATH。未部署 Cloudflare，不能把预想域名当成已生成地址。

GitHub 项目站无法控制账号根路径 robots.txt，也不支持任意服务器端 301。可直接提交项目 sitemap；以后迁移正式域名应在支持重定向的主机配置保留路径的 301，不能仅靠改 canonical 替代重定向。

## 下一阶段

优先核实五个工具需要的游戏真实数据与媒体许可，再接入独立 Supabase 实例；之后依据工具完成率和回访率，决定增加游戏、更新提醒和收藏等功能。首版不加载广告、不开发会员和支付。
