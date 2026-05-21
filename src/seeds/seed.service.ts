import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { SysUser } from '../modules/user/entities/user.entity';
import { SysRole } from '../modules/role/entities/role.entity';
import { SysRoleLayer } from '../modules/role/entities/role-layer.entity';
import { SysPermission } from '../modules/permission/entities/permission.entity';
import { MapLayer } from '../modules/layer/entities/layer.entity';
import { MapLayerGroup } from '../modules/layer/entities/layer-group.entity';
import { MapMarker } from '../modules/marker/entities/marker.entity';
import { MapBookmark } from '../modules/bookmark/entities/bookmark.entity';
import { SysLog } from '../modules/log/entities/log.entity';
import { SysRefreshToken } from '../modules/auth/entities/refresh-token.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'mars3d',
    entities: [SysUser, SysRole, SysRoleLayer, SysPermission, MapLayer, MapLayerGroup, MapMarker, MapBookmark, SysLog, SysRefreshToken],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('数据库连接成功，开始初始化种子数据...');

  const permRepo = dataSource.getRepository(SysPermission);
  const roleRepo = dataSource.getRepository(SysRole);
  const userRepo = dataSource.getRepository(SysUser);

  // ==================== 1. 初始化权限树 ====================
  const permissions = [
    // 系统管理 - 菜单
    { parentId: 0, name: '系统管理', code: 'system', type: 1, path: '/system', icon: 'SettingOutlined', sortOrder: 1 },
    { parentId: 0, name: '地图配置', code: 'map', type: 1, path: '/map', icon: 'EnvironmentOutlined', sortOrder: 2 },

    // 系统管理 - 用户
    { parentId: 1, name: '用户管理', code: 'system:user', type: 1, path: '/system/user', icon: 'UserOutlined', sortOrder: 1 },
    { parentId: 3, name: '用户列表', code: 'system:user:list', type: 2, path: '', icon: '', sortOrder: 1 },
    { parentId: 3, name: '创建用户', code: 'system:user:create', type: 2, path: '', icon: '', sortOrder: 2 },
    { parentId: 3, name: '编辑用户', code: 'system:user:edit', type: 2, path: '', icon: '', sortOrder: 3 },
    { parentId: 3, name: '删除用户', code: 'system:user:delete', type: 2, path: '', icon: '', sortOrder: 4 },

    // 系统管理 - 角色
    { parentId: 1, name: '角色管理', code: 'system:role', type: 1, path: '/system/role', icon: 'TeamOutlined', sortOrder: 2 },
    { parentId: 8, name: '角色列表', code: 'system:role:list', type: 2, path: '', icon: '', sortOrder: 1 },
    { parentId: 8, name: '创建角色', code: 'system:role:create', type: 2, path: '', icon: '', sortOrder: 2 },
    { parentId: 8, name: '编辑角色', code: 'system:role:edit', type: 2, path: '', icon: '', sortOrder: 3 },
    { parentId: 8, name: '删除角色', code: 'system:role:delete', type: 2, path: '', icon: '', sortOrder: 4 },

    // 系统管理 - 权限
    { parentId: 1, name: '权限管理', code: 'system:permission', type: 1, path: '/system/permission', icon: 'KeyOutlined', sortOrder: 3 },
    { parentId: 13, name: '权限列表', code: 'system:permission:list', type: 2, path: '', icon: '', sortOrder: 1 },
    { parentId: 13, name: '创建权限', code: 'system:permission:create', type: 2, path: '', icon: '', sortOrder: 2 },
    { parentId: 13, name: '编辑权限', code: 'system:permission:edit', type: 2, path: '', icon: '', sortOrder: 3 },
    { parentId: 13, name: '删除权限', code: 'system:permission:delete', type: 2, path: '', icon: '', sortOrder: 4 },

    // 系统管理 - 日志
    { parentId: 1, name: '日志管理', code: 'system:log', type: 1, path: '/system/log', icon: 'FileTextOutlined', sortOrder: 4 },
    { parentId: 18, name: '日志列表', code: 'system:log:list', type: 2, path: '', icon: '', sortOrder: 1 },

    // 地图配置 - 图层
    { parentId: 2, name: '图层管理', code: 'map:layer', type: 1, path: '/map/layer', icon: 'AppstoreOutlined', sortOrder: 1 },
    { parentId: 20, name: '图层列表', code: 'map:layer:list', type: 2, path: '', icon: '', sortOrder: 1 },
    { parentId: 20, name: '创建图层', code: 'map:layer:create', type: 2, path: '', icon: '', sortOrder: 2 },
    { parentId: 20, name: '编辑图层', code: 'map:layer:edit', type: 2, path: '', icon: '', sortOrder: 3 },
    { parentId: 20, name: '删除图层', code: 'map:layer:delete', type: 2, path: '', icon: '', sortOrder: 4 },

    // 地图配置 - 标记
    { parentId: 2, name: '标记管理', code: 'map:marker', type: 1, path: '/map/marker', icon: 'EnvironmentOutlined', sortOrder: 2 },
    { parentId: 25, name: '标记列表', code: 'map:marker:list', type: 2, path: '', icon: '', sortOrder: 1 },
    { parentId: 25, name: '创建标记', code: 'map:marker:create', type: 2, path: '', icon: '', sortOrder: 2 },
    { parentId: 25, name: '编辑标记', code: 'map:marker:edit', type: 2, path: '', icon: '', sortOrder: 3 },
    { parentId: 25, name: '删除标记', code: 'map:marker:delete', type: 2, path: '', icon: '', sortOrder: 4 },

    // 地图配置 - 书签
    { parentId: 2, name: '书签管理', code: 'map:bookmark', type: 1, path: '/map/bookmark', icon: 'BookOutlined', sortOrder: 3 },
    { parentId: 30, name: '书签列表', code: 'map:bookmark:list', type: 2, path: '', icon: '', sortOrder: 1 },
  ];

  // 检查是否已初始化
  const existingCount = await permRepo.count();
  if (existingCount > 0) {
    console.log(`权限表已有 ${existingCount} 条数据，跳过权限和角色数据初始化`);
  } else {
    // 批量插入权限
    const savedPerms: SysPermission[] = [];
    for (const permData of permissions) {
      const perm = permRepo.create(permData);
      const saved = await permRepo.save(perm);
      savedPerms.push(saved);
    }
    console.log(`已创建 ${savedPerms.length} 个权限节点`);

    // ==================== 2. 初始化角色 ====================
    const adminRole = roleRepo.create({
      name: '超级管理员',
      code: 'admin',
      description: '拥有全部权限',
      permissions: savedPerms,
    });
    await roleRepo.save(adminRole);

    const editorRole = roleRepo.create({
      name: '编辑者',
      code: 'editor',
      description: '可编辑地图数据',
      permissions: savedPerms.filter((p) =>
        !p.code.includes('delete') && !p.code.includes('system:user') && !p.code.includes('system:role') && !p.code.includes('system:permission')
      ),
    });
    await roleRepo.save(editorRole);

    const viewerRole = roleRepo.create({
      name: '查看者',
      code: 'viewer',
      description: '仅查看权限',
      permissions: savedPerms.filter((p) => p.code.endsWith(':list')),
    });
    await roleRepo.save(viewerRole);

    console.log('已创建 3 个默认角色: admin, editor, viewer');

    // ==================== 3. 初始化管理员用户 ====================
    const adminUser = userRepo.create({
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      nickname: '超级管理员',
      email: 'admin@mars3d.com',
      roles: [adminRole],
    });
    await userRepo.save(adminUser);

    console.log('已创建管理员用户: admin / admin123');
  }

  // ==================== 4. 初始化图层分组与图层数据 ====================
  const layerGroupRepo = dataSource.getRepository(MapLayerGroup);
  const layerRepo = dataSource.getRepository(MapLayer);

  console.log('正在清空旧的图层与分组数据...');
  await layerRepo.createQueryBuilder().delete().execute();
  await layerGroupRepo.createQueryBuilder().delete().execute();

  console.log('开始从 config.json 导入全部地图服务及专题图层...');

    // 4.1 创建三个顶层业务分组
    const groupBasemap = layerGroupRepo.create({ name: '地图底图', sortOrder: 1 });
    const groupLayer = layerGroupRepo.create({ name: '专题业务图层', sortOrder: 2 });
    const groupTerrain = layerGroupRepo.create({ name: '地形数据服务', sortOrder: 3 });
    const savedGroups = await layerGroupRepo.save([groupBasemap, groupLayer, groupTerrain]);
    console.log('创建默认图层业务大组完成:', savedGroups.map(g => ({ id: g.id, name: g.name })));

    const basemapGroupId = savedGroups.find(g => g.name === '地图底图')?.id || 1;
    const layerGroupId = savedGroups.find(g => g.name === '专题业务图层')?.id || 2;
    const terrainGroupId = savedGroups.find(g => g.name === '地形数据服务')?.id || 3;

    try {
      const configPath = path.resolve('d:/code/mars3d/mars3d-vue-project/public/config/config.json');
      if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, 'utf8');
        if (content.charCodeAt(0) === 0xfeff) {
          content = content.slice(1);
        }
        const configJson = JSON.parse(content);

        // 用于保存临时记录
        const layersToInsert: any[] = [];
        const pidMap = new Map<number, number>(); // 存储图层 ID -> 父级 ID

        // 4.2 收集地形服务
        if (configJson.terrain) {
          const t = configJson.terrain;
          layersToInsert.push({
            id: 1,
            name: '全球地形',
            type: 'terrain',
            url: t.url || '',
            category: 'terrain',
            show: t.show ?? true,
            groupId: terrainGroupId,
            status: 1,
            sortOrder: 1,
            config: { url: t.url, show: t.show, clip: t.clip }
          });
        }

        // 4.3 收集底图服务
        if (configJson.basemaps && Array.isArray(configJson.basemaps)) {
          let autoId = 10000;
          for (const item of configJson.basemaps) {
            const lid = item.id || ++autoId;
            const configData = { ...item };
            delete configData.id;
            delete configData.pid;
            delete configData.name;
            delete configData.type;
            delete configData.show;

            layersToInsert.push({
              id: lid,
              name: item.name || '未命名底图',
              type: item.type || 'xyz',
              url: item.url || '',
              category: 'basemap',
              show: item.show ?? false,
              groupId: basemapGroupId,
              status: 1,
              sortOrder: item.sortOrder || 0,
              config: configData
            });

            if (item.pid) {
              // 存储子图层 id -> 父图层 config id 的映射
              pidMap.set(lid, item.pid);
            }
          }
        }

        // 4.4 收集专题图层服务
        if (configJson.layers && Array.isArray(configJson.layers)) {
          let autoId = 20000;
          for (const item of configJson.layers) {
            const lid = item.id || ++autoId;
            const configData = { ...item };
            delete configData.id;
            delete configData.pid;
            delete configData.name;
            delete configData.type;
            delete configData.show;

            layersToInsert.push({
              id: lid,
              name: item.name || '未命名图层',
              type: item.type || 'geojson',
              url: item.url || '',
              category: 'layer',
              show: item.show ?? false,
              groupId: layerGroupId,
              status: 1,
              sortOrder: item.sortOrder || 0,
              config: configData
            });

            if (item.pid) {
              // 存储子图层 id -> 父图层 config id 的映射
              pidMap.set(lid, item.pid);
            }
          }
        }

        // 4.5 第一阶段：插入所有图层，此时 pid 置为 null 避免外键约束报错
        // 使用 QueryBuilder.insert() 确保显式设置的 id 被保留
        // (TypeORM 的 save() 对 @PrimaryGeneratedColumn 可能忽略显式 id)
        console.log(`第一阶段：插入所有图层实体，共 ${layersToInsert.length} 条记录...`);
        for (const raw of layersToInsert) {
          await layerRepo.createQueryBuilder()
            .insert()
            .into(MapLayer)
            .values({ ...raw, pid: null })
            .orIgnore()
            .execute();
        }

        // 4.6 第二阶段：还原并建立父子关系 (pid)
        console.log('第二阶段：还原并建立父子图层关系 (pid)...');
        // 获取所有数据库中存在的图层 id
        const dbLayers = await layerRepo.find({ select: ['id'] });
        const dbIds = new Set(dbLayers.map(l => l.id));

        for (const [childId, parentId] of pidMap.entries()) {
          // 确保父子图层都在数据库中存在，才更新 pid
          if (dbIds.has(childId) && dbIds.has(parentId)) {
            await layerRepo.update(childId, { pid: parentId });
          } else {
            if (!dbIds.has(parentId)) {
              console.warn(`跳过无效的父图层关联: 子图层 ${childId} 的 pid (${parentId}) 在数据库中不存在`);
            }
            if (!dbIds.has(childId)) {
              console.warn(`跳过无效的子图层: 子图层 ${childId} 在数据库中不存在`);
            }
          }
        }

        // 4.7 重置 PG 图层自增主键序列
        await dataSource.query(`SELECT setval(pg_get_serial_sequence('map_layer', 'id'), COALESCE(MAX(id), 1)) FROM map_layer`);
        console.log('图层表主键自增序列修正完毕！');
      } else {
        console.warn(`未能在路径 ${configPath} 找到 config.json，跳过图层种子导入`);
      }
    } catch (e) {
      console.error('导入 config.json 失败:', e.message);
    }

  console.log('种子数据初始化完成！');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
