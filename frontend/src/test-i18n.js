// 简单的多语言测试脚本
import { getMessage, setLanguage } from './lang';

// 测试TodoPanel相关的消息
console.log('=== TodoPanel Messages ===');
console.log('Chinese - createNewTask:', getMessage('createNewTask'));
console.log('Chinese - statusPending:', getMessage('statusPending'));
console.log('Chinese - priorityP0:', getMessage('priorityP0'));

// 切换到英文
await setLanguage('en');

console.log('English - createNewTask:', getMessage('createNewTask'));
console.log('English - statusPending:', getMessage('statusPending'));
console.log('English - priorityP0:', getMessage('priorityP0'));

// 测试TodoEditModal相关的消息
console.log('\n=== TodoEditModal Messages ===');
console.log('English - editTodoTitle:', getMessage('editTodoTitle'));
console.log('English - splitTask:', getMessage('splitTask'));
console.log('English - todoTitleRequired:', getMessage('todoTitleRequired'));

// 切换回中文
await setLanguage('zh');

console.log('Chinese - editTodoTitle:', getMessage('editTodoTitle'));
console.log('Chinese - splitTask:', getMessage('splitTask'));
console.log('Chinese - todoTitleRequired:', getMessage('todoTitleRequired'));

// 测试参数替换
console.log('\n=== Parameter Replacement Test ===');
console.log('taskSplitSuccess with count:', getMessage('taskSplitSuccess', { count: '5' }));
console.log('dueDate with date:', getMessage('dueDate', { date: '2024-01-15' }));
