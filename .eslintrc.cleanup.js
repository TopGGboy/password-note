// ESLint配置 - 用于项目净化
// 可以逐步启用这些规则来保持代码质量

module.exports = {
  extends: [
    // 你现有的配置
  ],
  rules: {
    // 禁止使用console (可以逐步启用)
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // 禁止使用alert, confirm, prompt
    'no-alert': 'warn',
    
    // 禁止使用debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // 禁止未使用的变量
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    
    // 禁止未使用的导入
    'no-unused-imports/no-unused-imports': 'warn',
    
    // 强制使用const
    'prefer-const': 'warn',
    
    // 禁止使用any类型 (TypeScript)
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 禁止空的catch块
    'no-empty': ['error', { allowEmptyCatch: false }],
    
    // 禁止重复的导入
    'no-duplicate-imports': 'error',
    
    // 强制使用模板字符串
    'prefer-template': 'warn',
    
    // 禁止不必要的return await
    'no-return-await': 'error'
  },
  
  // 忽略某些文件的console检查
  overrides: [
    {
      files: ['src/utils/logger.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};