
interface Message {
  en: string;
  zh: string;
}

export const monacoEditorMessages: { [key: string]: Message } = {
  // 编辑器加载
  'monacoEditor.loading': {
    en: "Loading editor...",
    zh: "编辑器加载中..."
  },
  
  // 语言支持
  'monacoEditor.languageSupportLoaded': {
    en: "Language support loaded",
    zh: "语言支持已加载"
  },
  'monacoEditor.languageSupportFailed': {
    en: "Failed to load language support for {{language}}",
    zh: "加载 {{language}} 语言支持失败"
  },
  'monacoEditor.errorLoadingLanguage': {
    en: "Error loading language support",
    zh: "加载语言支持时出错"
  },
  
  // 开发调试信息
  'dev.monacoEditor.willMount': {
    en: "Monaco Editor will mount",
    zh: "Monaco 编辑器即将挂载"
  },
  'dev.monacoEditor.didMount': {
    en: "Monaco Editor mounted successfully",
    zh: "Monaco 编辑器挂载成功"
  },
  'dev.monacoEditor.attemptingLoad': {
    en: "Attempting to load language support for",
    zh: "尝试加载语言支持："
  },
  'dev.monacoEditor.languageSupported': {
    en: "Language {{language}} is already supported",
    zh: "语言 {{language}} 已经支持"
  },
  
  // 编辑器功能
  'monacoEditor.formatCode': {
    en: "Format Code",
    zh: "格式化代码"
  },
  'monacoEditor.toggleMinimap': {
    en: "Toggle Minimap",
    zh: "切换小地图"
  },
  'monacoEditor.toggleWordWrap': {
    en: "Toggle Word Wrap",
    zh: "切换自动换行"
  },
  'monacoEditor.changeTheme': {
    en: "Change Theme",
    zh: "更换主题"
  },
  
  // 错误信息
  'monacoEditor.initializationFailed': {
    en: "Failed to initialize Monaco Editor",
    zh: "Monaco 编辑器初始化失败"
  },
  'monacoEditor.saveError': {
    en: "Failed to save file",
    zh: "保存文件失败"
  },
  'monacoEditor.loadError': {
    en: "Failed to load file content",
    zh: "加载文件内容失败"
  }
};

