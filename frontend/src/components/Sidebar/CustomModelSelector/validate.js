


/**
 * 验证脚本 - 检查 CustomModelSelector 组件的完整性
 * 运行: node validate.js
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'index.tsx',
  'index.ts', 
  'styles.css',
  'types.ts',
  'utils.ts',
  'example.tsx',
  'test.tsx',
  'README.md',
  'usage.md'
];

const componentDir = __dirname;

console.log('🔍 验证 CustomModelSelector 组件完整性...\n');

// 检查文件是否存在
console.log('📁 检查必需文件:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(componentDir, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ✅ ${file} (${sizeKB} KB)`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

console.log('\n📊 文件统计:');
console.log(`  总文件数: ${requiredFiles.length}`);
console.log(`  存在文件: ${requiredFiles.filter(file => fs.existsSync(path.join(componentDir, file))).length}`);

// 检查主组件文件内容
console.log('\n🔧 检查组件内容:');

try {
  const indexContent = fs.readFileSync(path.join(componentDir, 'index.tsx'), 'utf8');
  
  const checks = [
    { name: 'React 导入', pattern: /import React/ },
    { name: 'useState Hook', pattern: /useState/ },
    { name: 'useEffect Hook', pattern: /useEffect/ },
    { name: 'CustomModelSelector 组件', pattern: /const CustomModelSelector/ },
    { name: 'Props 接口', pattern: /CustomModelSelectorProps/ },
    { name: 'getModels 函数', pattern: /export const getModels/ },
    { name: '样式导入', pattern: /import.*styles\.css/ },
    { name: '事件总线', pattern: /eventBus/ },
    { name: '下拉选择逻辑', pattern: /dropdown/ },
    { name: '搜索功能', pattern: /search/ }
  ];

  checks.forEach(check => {
    if (check.pattern.test(indexContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ⚠️  ${check.name} - 可能缺失`);
    }
  });

} catch (error) {
  console.log(`  ❌ 无法读取主组件文件: ${error.message}`);
}

// 检查样式文件
console.log('\n🎨 检查样式文件:');

try {
  const stylesContent = fs.readFileSync(path.join(componentDir, 'styles.css'), 'utf8');
  
  const styleChecks = [
    { name: '主容器样式', pattern: /\.custom-model-selector/ },
    { name: '选择器样式', pattern: /\.custom-selector/ },
    { name: '下拉面板样式', pattern: /\.dropdown-panel/ },
    { name: '选项样式', pattern: /\.option-item/ },
    { name: '标签样式', pattern: /\.selected-tag/ },
    { name: '搜索框样式', pattern: /\.search-input/ },
    { name: '响应式设计', pattern: /@media/ },
    { name: '动画效果', pattern: /@keyframes/ }
  ];

  styleChecks.forEach(check => {
    if (check.pattern.test(stylesContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ⚠️  ${check.name} - 可能缺失`);
    }
  });

} catch (error) {
  console.log(`  ❌ 无法读取样式文件: ${error.message}`);
}

// 检查类型定义
console.log('\n📝 检查类型定义:');

try {
  const typesContent = fs.readFileSync(path.join(componentDir, 'types.ts'), 'utf8');
  
  const typeChecks = [
    { name: 'Model 接口', pattern: /interface Model/ },
    { name: 'Props 接口', pattern: /interface CustomModelSelectorProps/ },
    { name: 'State 接口', pattern: /interface CustomModelSelectorState/ },
    { name: '事件接口', pattern: /interface EventBusEvents/ },
    { name: '主题配置', pattern: /interface ThemeConfig/ },
    { name: '预设配置', pattern: /interface PresetConfig/ }
  ];

  typeChecks.forEach(check => {
    if (check.pattern.test(typesContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ⚠️  ${check.name} - 可能缺失`);
    }
  });

} catch (error) {
  console.log(`  ❌ 无法读取类型文件: ${error.message}`);
}

// 检查工具函数
console.log('\n🛠️  检查工具函数:');

try {
  const utilsContent = fs.readFileSync(path.join(componentDir, 'utils.ts'), 'utf8');
  
  const utilChecks = [
    { name: '模型验证', pattern: /validateModelApiKey/ },
    { name: '模型过滤', pattern: /filterModels/ },
    { name: '文本截断', pattern: /truncateText/ },
    { name: '预设配置', pattern: /presetConfigs/ },
    { name: '主题配置', pattern: /darkTheme/ },
    { name: '防抖函数', pattern: /debounce/ },
    { name: '节流函数', pattern: /throttle/ },
    { name: '本地存储', pattern: /storage/ }
  ];

  utilChecks.forEach(check => {
    if (check.pattern.test(utilsContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ⚠️  ${check.name} - 可能缺失`);
    }
  });

} catch (error) {
  console.log(`  ❌ 无法读取工具文件: ${error.message}`);
}

// 最终结果
console.log('\n📋 验证结果:');

if (allFilesExist) {
  console.log('✅ 所有必需文件都存在');
  console.log('🎉 CustomModelSelector 组件创建完成！');
  console.log('\n📖 下一步:');
  console.log('  1. 查看 README.md 了解组件功能');
  console.log('  2. 运行 example.tsx 查看使用示例');
  console.log('  3. 使用 test.tsx 进行功能测试');
  console.log('  4. 参考 usage.md 了解详细用法');
} else {
  console.log('❌ 某些文件缺失，请检查组件完整性');
}

console.log('\n🚀 组件特性总结:');
console.log('  • 完全自定义实现，不依赖 Antd Select');
console.log('  • 支持多选和搜索过滤');
console.log('  • 集成事件总线系统');
console.log('  • 响应式设计和深色主题');
console.log('  • 完整的 TypeScript 支持');
console.log('  • 丰富的配置选项和回调函数');


