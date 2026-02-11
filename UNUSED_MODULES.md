后端模块使用情况简要（基于代码静态分析）
- disclosure_collect: 未在控制器/服务中找到独立实现，当前披露相关功能未暴露“收藏”入口，因此视为未使用的子模块。若后续需要保留收藏功能，请在 DisclosureController 或新建模块中实现对收藏的完整支持。
- disclosure_like: 与上同理，未在后端暴露独立的点赞接口，当前披露相关的点赞功能已被注释/移除。
- goods_collect: 没有单独的 GoodsCollect 模块，相关收藏能力实际通过 /goods/collect、/goods/cancelCollect 等端点在 GoodsController 内实现，属于同一模块的内聚实现，不是独立子模块。
- goods_like: 同上，点赞能力在 /goods/like、/goods/dislike 中实现，未独立成一个子模块。
- picture: 数据实体 Picture 与 PictureMapper 存在，但未在控制器或服务中被使用，目前看不到用于 API 的图片相关端点。若未来需要图片上传/管理，应单独评估并实现控制器。当前可视为未暴露的后端接口点。

结论与建议
- 若你希望严格按你的 UI 目录结构对后端进行瘦身，可以考虑删除 disclose/like 相关的期望占位目录（如果确实不再计划单独维护收藏/点赞的披露端点）。目前后端实现集中在 DisclosureController，相关收藏/点赞逻辑已移除，不需要保留独立模块。
- 对 goods_collect/goods_like 这样的命名模块，实际后端仍依赖 GoodsController 的方法实现，若你希望前后端结构统一，可以考虑将收藏/点赞作为子模块并建立相应的微服务/模块划分；若不需要，可继续保持现状，删除相应 UI 目录以减少歧义。
- 如果确定不需要 Picture 的后端支撑，且无其他模块依赖，可以考虑把 Picture.java、PictureMapper.java 与相关 XML Mapper 删除，以减少维护成本；在删除前请确认前端是否通过图片服务或云存储独立处理图片（例如对象存储、CDN、外部图片库等）。

后续动作（可选执行）
- 生成一个 patch，清理上述未使用的后端源文件及前端相关占位目录（如确实不再需要），并在代码库中添加注释或文档说明此变更。
- 为未使用的后端端点添加死代码清理注释，便于后续审计与团队沟通。
