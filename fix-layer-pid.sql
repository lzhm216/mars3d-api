-- ============================================================
-- 修复 map_layer 表的 pid (父子层级关系)
-- 基于 config.json 的图层层级结构
-- ============================================================
-- 问题说明：
--   seed.service.ts 导入 config.json 时，没有显式 id 的图层由数据库自增分配 ID，
--   导致 pidMap 中存储的原始 config id 与实际数据库 id 不匹配，父子关系失效。
--
-- 修复策略：
--   通过 name + category + type 三元组匹配，重建正确的父子关系。
-- ============================================================

BEGIN;

-- ==================== Step 1: 清除所有错误的 pid ====================
-- 先将所有 pid 置为 null，避免旧的错误关系残留
UPDATE map_layer SET pid = NULL;

-- ==================== Step 2: 重建 basemaps 父子关系 ====================
-- 顶级分组: "地图底图" (config id: 10, category: basemap, type: group)
-- 所有 category='basemap' 且非顶级分组的记录，其 pid 应指向 "地图底图"
UPDATE map_layer child
SET pid = (
    SELECT p.id FROM map_layer p
    WHERE p.name = '地图底图' AND p.category = 'basemap' AND p.type = 'group' AND p.pid IS NULL
    LIMIT 1
)
WHERE child.category = 'basemap'
  AND child.pid IS NULL
  AND NOT (child.name = '地图底图' AND child.type = 'group');

-- ==================== Step 3: 重建 layers 父子关系 ====================
-- 使用 CTE 批量更新，通过 name + category + type 精确匹配

WITH parent_map (parent_name, child_name, child_type) AS (
    VALUES
        -- 一级分组 -> 其直接子项 (通过 name 关联)
        ('辅助图层',    '经纬网',          'graticule'),
        ('辅助图层',    '行政区划界线',     'tdt'),
        ('辅助图层',    '高德实时路况',     'gaode'),
        ('辅助图层',    '百度实时路况',     'baidu'),

        ('地形',        'Cesium地形',      'terrain'),
        ('地形',        'Mars3D地形',      'terrain'),
        ('地形',        'ArcGIS地形',      'terrain'),
        ('地形',        '无地形',          'terrain'),

        ('矢量数据',    'GeoJSON数据',     'group'),
        ('矢量数据',    'GeoServer WFS',   'group'),
        ('矢量数据',    'ArcGIS WFS',      'group'),
        ('矢量数据',    'CZML数据',        'group'),
        ('矢量数据',    'KML数据',         'group'),

        ('栅格数据',    'OGC WMS服务',     'group'),
        ('栅格数据',    'ArcGIS 瓦片',     'group'),
        ('栅格数据',    'ArcGIS Dynamic',  'group'),

        ('三维模型',    'gltf模型',        'group'),
        ('三维模型',    '城市白模',        'group'),
        ('三维模型',    '点云',            'group'),
        ('三维模型',    'BIM模型',         'group'),
        ('三维模型',    '人工建模',        'group'),
        ('三维模型',    '倾斜摄影',        'group'),

        -- 二级分组 -> 其叶子节点
        ('GeoJSON数据',      '平台标绘',      'geojson'),
        ('GeoJSON数据',      '用地规划',      'geojson'),
        ('GeoJSON数据',      '建筑物面',      'geojson'),
        ('GeoJSON数据',      '安徽各市',      'geojson'),
        ('GeoJSON数据',      '中国省界',      'geojson'),
        ('GeoJSON数据',      '西藏垭口',      'geojson'),
        ('GeoJSON数据',      '体育设施点',    'geojson'),

        ('GeoServer WFS',    '建筑物面',      'wfs'),
        ('GeoServer WFS',    '教育设施点',    'wfs'),

        ('ArcGIS WFS',       '兴趣点',       'arcgis_wfs'),
        ('ArcGIS WFS',       '道路',         'arcgis_wfs'),
        ('ArcGIS WFS',       '建筑物面',      'arcgis_wfs'),

        ('CZML数据',         '汽车',         'czml'),
        ('CZML数据',         '卫星轨道',      'czml'),

        ('KML数据',          '海上安全警告',   'kml'),
        ('KML数据',          '国境线',        'kml'),
        ('KML数据',          '省界线',        'kml'),

        ('OGC WMS服务',      '教育设施点',    'wms'),
        ('OGC WMS服务',      '道路线',        'wms'),
        ('OGC WMS服务',      '建筑物面',      'wms'),
        ('OGC WMS服务',      '规划面',        'wms'),

        ('ArcGIS 瓦片',      '合肥规划图',    'arcgis_cache'),

        ('ArcGIS Dynamic',   '主要道路',      'arcgis'),
        ('ArcGIS Dynamic',   '建筑物',        'arcgis'),
        ('ArcGIS Dynamic',   '规划',         'arcgis'),

        ('gltf模型',         '风力发电机',    'graphic'),
        ('gltf模型',         '警车',         'graphic'),

        ('城市白模',         '合肥市区',      'tileset'),
        ('城市白模',         '合肥市区-带贴图', 'tileset'),
        ('城市白模',         '上海市区',      'tileset'),

        ('点云',             '高压线塔杆',    'tileset'),

        ('BIM模型',          '大学教学楼',    'tileset'),
        ('BIM模型',          '轻轨地铁站',    'tileset'),
        ('BIM模型',          '桥梁',         'tileset'),

        ('人工建模',         '地下管网',      'tileset'),
        ('人工建模',         '石化工厂',      'tileset'),
        ('人工建模',         '水利闸门',      'group'),

        ('水利闸门',         '闸门',         'graphic'),
        ('水利闸门',         '整体',         'tileset'),

        ('倾斜摄影',         '大雁塔',        'tileset'),
        ('倾斜摄影',         '县城社区',      'tileset'),
        ('倾斜摄影',         '合肥天鹅湖',    'tileset'),
        ('倾斜摄影',         '文庙-单体化',   'geojson'),
        ('倾斜摄影',         '文庙',         'tileset')
)
UPDATE map_layer child
SET pid = p.id
FROM parent_map pm
JOIN map_layer p ON p.name = pm.parent_name
    AND p.category = 'layer'
    AND p.pid IS NULL
WHERE child.name = pm.child_name
    AND child.category = 'layer'
    AND child.type = pm.child_type
    AND child.pid IS NULL;

-- ==================== Step 4: 验证结果 ====================

-- 4.1 检查顶级分组及其子项数量
SELECT
    p.id,
    p.name AS parent_name,
    p.category,
    p.type,
    COUNT(c.id) AS children_count
FROM map_layer p
LEFT JOIN map_layer c ON c.pid = p.id
WHERE p.pid IS NULL
GROUP BY p.id, p.name, p.category, p.type
ORDER BY p.category, p.name;

-- 4.2 检查是否还有未关联 pid 的非顶级图层 (应该为 0)
SELECT category, COUNT(*) AS orphan_count
FROM map_layer
WHERE pid IS NULL
  AND NOT (
      (name = '地图底图' AND type = 'group' AND category = 'basemap')
      OR (name = '辅助图层' AND type = 'group' AND category = 'layer')
      OR (name = '地形' AND type = 'group' AND category = 'layer')
      OR (name = '栅格数据' AND type = 'group' AND category = 'layer')
      OR (name = '矢量数据' AND type = 'group' AND category = 'layer')
      OR (name = '三维模型' AND type = 'group' AND category = 'layer')
      OR (name = '数据图层' AND type = 'group' AND category = 'layer')
      OR category = 'terrain'
  )
GROUP BY category;

-- 4.3 完整的图层树形结构
SELECT
    CASE
        WHEN p.pid IS NULL THEN p.name
        WHEN c.id IS NOT NULL THEN '  └─ ' || c.name
    END AS tree,
    p.id,
    p.pid,
    p.type,
    p.category
FROM map_layer p
LEFT JOIN map_layer c ON c.pid = p.id
WHERE p.pid IS NULL
ORDER BY p.category, p.name, c.name;

COMMIT;

-- ============================================================
-- 如果验证结果不正确，可执行 ROLLBACK 回滚
-- 如果确认无误，COMMIT 已提交更改
-- ============================================================
