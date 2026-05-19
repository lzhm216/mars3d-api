import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SysUser } from '../modules/user/entities/user.entity';
import { SysRole } from '../modules/role/entities/role.entity';
import { SysRoleLayer } from '../modules/role/entities/role-layer.entity';
import { SysPermission } from '../modules/permission/entities/permission.entity';
import { MapLayer } from '../modules/layer/entities/layer.entity';
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
    entities: [SysUser, SysRole, SysRoleLayer, SysPermission, MapLayer, MapMarker, MapBookmark, SysLog, SysRefreshToken],
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
    console.log(`权限表已有 ${existingCount} 条数据，跳过种子数据初始化`);
    await dataSource.destroy();
    return;
  }

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
  console.log('种子数据初始化完成！');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
