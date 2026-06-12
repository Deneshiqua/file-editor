import React2, { createContext, useReducer, useRef, useCallback, useContext, useState, useEffect } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { createPortal } from 'react-dom';
import Editor from '@monaco-editor/react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/utils/helpers.ts
function normalizeManagerPath(path) {
  if (!path || path === "/") return "/";
  let normalized = path.replace(/\\/g, "/").replace(/\/+/g, "/");
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}
function toStoragePath(path) {
  const normalized = normalizeManagerPath(path);
  return normalized === "/" ? "" : normalized.slice(1);
}
function sanitizeStorageFileName(fileName, maxBaseLength = 180) {
  const trimmed = fileName.trim();
  if (!trimmed) {
    return `file-${Date.now()}`;
  }
  const lastDot = trimmed.lastIndexOf(".");
  const hasExtension = lastDot > 0 && lastDot < trimmed.length - 1;
  const rawBase = hasExtension ? trimmed.slice(0, lastDot) : trimmed;
  const extension = hasExtension ? trimmed.slice(lastDot + 1).toLowerCase() : "";
  let base = rawBase.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  if (!base) {
    base = "file";
  }
  if (base.length > maxBaseLength) {
    base = base.slice(0, maxBaseLength).replace(/[-.]+$/g, "");
  }
  const safeExtension = extension.replace(/[^a-z0-9]+/gi, "");
  return safeExtension ? `${base}.${safeExtension}` : base;
}
function formatFileSize(bytes) {
  if (bytes === 0) return "\u2014";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 7) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
function getFileExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}
function getFileBaseName(filename) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex <= 0) return filename;
  return filename.substring(0, lastDotIndex);
}
function truncateFileName(filename, maxLength = 15) {
  if (filename.length <= maxLength) return filename;
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return filename.substring(0, maxLength - 3) + "...";
  }
  const extension = filename.substring(lastDotIndex);
  const nameWithoutExt = filename.substring(0, lastDotIndex);
  if (extension.length >= maxLength - 3) {
    return filename.substring(0, maxLength - 3) + "...";
  }
  const availableLength = maxLength - extension.length - 3;
  if (availableLength <= 0) {
    return filename.substring(0, maxLength - 3) + "...";
  }
  return nameWithoutExt.substring(0, availableLength) + "..." + extension;
}
function isPreviewable(mimeType, name) {
  const ext = getFileExtension(name);
  if (mimeType.startsWith("image/")) return true;
  if (mimeType.startsWith("video/")) return true;
  if (mimeType.startsWith("audio/")) return true;
  if (mimeType === "application/pdf") return true;
  if (["txt", "md", "json", "xml", "csv", "log", "js", "ts", "jsx", "tsx", "css", "html", "py", "java", "cpp", "c", "h", "sh", "yml", "yaml"].includes(ext)) return true;
  return false;
}
var FILE_CATEGORIES = {
  documents: [
    "pdf",
    "doc",
    "docx",
    "txt",
    "rtf",
    "odt",
    "xls",
    "xlsx",
    "csv",
    "ods",
    "ppt",
    "pptx",
    "odp",
    "md",
    "json",
    "xml",
    "yaml",
    "yml"
  ],
  images: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "svg",
    "webp",
    "ico",
    "tiff",
    "tif",
    "heic",
    "heif"
  ],
  media: [
    "mp3",
    "wav",
    "ogg",
    "flac",
    "aac",
    "m4a",
    "mp4",
    "avi",
    "mkv",
    "mov",
    "wmv",
    "flv",
    "webm",
    "m4v"
  ]
};
function getFileCategory(file) {
  if (file.isDirectory) return "all";
  const ext = getFileExtension(file.name);
  if (FILE_CATEGORIES.documents.includes(ext)) return "documents";
  if (FILE_CATEGORIES.images.includes(ext)) return "images";
  if (FILE_CATEGORIES.media.includes(ext)) return "media";
  return "other";
}
function filterByCategory(files, category) {
  if (category === "all") return files;
  return files.filter((file) => {
    if (file.isDirectory) return true;
    return getFileCategory(file) === category;
  });
}
function getAcceptForCategory(category) {
  if (category === "all" || category === "other") return void 0;
  const extensions = FILE_CATEGORIES[category];
  return extensions.map((ext) => `.${ext}`).join(",");
}
function fileMatchesCategory(fileName, category) {
  if (category === "all") return true;
  if (category === "other") {
    const ext2 = getFileExtension(fileName);
    return !FILE_CATEGORIES.documents.includes(ext2) && !FILE_CATEGORIES.images.includes(ext2) && !FILE_CATEGORIES.media.includes(ext2);
  }
  const ext = getFileExtension(fileName);
  return FILE_CATEGORIES[category].includes(ext);
}
function sortFiles(files, config) {
  const sorted = [...files].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    let comparison = 0;
    switch (config.field) {
      case "name":
        comparison = a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "type":
        comparison = getFileExtension(a.name).localeCompare(getFileExtension(b.name));
        break;
      case "modifiedAt":
        comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
        break;
    }
    return config.order === "asc" ? comparison : -comparison;
  });
  return sorted;
}
function filterFiles(files, query, hideSystemFiles = true) {
  let filtered = files;
  if (hideSystemFiles) {
    const systemFilePatterns = [".folderkeep", ".gitkeep", ".DS_Store", "Thumbs.db"];
    filtered = filtered.filter((f) => !systemFilePatterns.includes(f.name));
  }
  if (!query.trim()) return filtered;
  const q = query.toLowerCase();
  return filtered.filter(
    (f) => f.name.toLowerCase().includes(q) || getFileExtension(f.name).includes(q)
  );
}
var initialState = {
  currentPath: "/",
  files: [],
  selectedItems: [],
  viewMode: "grid",
  sortConfig: { field: "modifiedAt", order: "desc" },
  clipboard: { items: [], operation: null },
  searchQuery: "",
  activeCategory: "all",
  isLoading: false,
  error: null,
  activeModal: null,
  previewItem: null,
  renameItem: null,
  uploadProgress: [],
  navigationHistory: ["/"],
  historyIndex: 0,
  sidebarFolders: []
};
function fileManagerReducer(state, action) {
  switch (action.type) {
    case "SET_PATH":
      return __spreadProps(__spreadValues({}, state), { currentPath: action.payload });
    case "SET_FILES":
      return __spreadProps(__spreadValues({}, state), { files: action.payload });
    case "SET_LOADING":
      return __spreadProps(__spreadValues({}, state), { isLoading: action.payload });
    case "SET_ERROR":
      return __spreadProps(__spreadValues({}, state), { error: action.payload });
    case "SELECT_ITEM":
      return __spreadProps(__spreadValues({}, state), { selectedItems: [action.payload] });
    case "TOGGLE_SELECT": {
      const exists = state.selectedItems.find((i) => i.id === action.payload.id);
      return __spreadProps(__spreadValues({}, state), {
        selectedItems: exists ? state.selectedItems.filter((i) => i.id !== action.payload.id) : [...state.selectedItems, action.payload]
      });
    }
    case "SELECT_ALL":
      return __spreadProps(__spreadValues({}, state), { selectedItems: [...state.files] });
    case "CLEAR_SELECTION":
      return __spreadProps(__spreadValues({}, state), { selectedItems: [] });
    case "SET_VIEW_MODE":
      return __spreadProps(__spreadValues({}, state), { viewMode: action.payload });
    case "SET_SORT":
      return __spreadProps(__spreadValues({}, state), { sortConfig: action.payload });
    case "SET_SEARCH":
      return __spreadProps(__spreadValues({}, state), { searchQuery: action.payload });
    case "SET_CATEGORY":
      return __spreadProps(__spreadValues({}, state), { activeCategory: action.payload });
    case "SET_CLIPBOARD":
      return __spreadProps(__spreadValues({}, state), { clipboard: action.payload });
    case "CLEAR_CLIPBOARD":
      return __spreadProps(__spreadValues({}, state), { clipboard: { items: [], operation: null } });
    case "SET_MODAL":
      return __spreadProps(__spreadValues({}, state), { activeModal: action.payload });
    case "SET_PREVIEW_ITEM":
      return __spreadProps(__spreadValues({}, state), { previewItem: action.payload });
    case "SET_RENAME_ITEM":
      return __spreadProps(__spreadValues({}, state), { renameItem: action.payload });
    case "SET_UPLOAD_PROGRESS":
      return __spreadProps(__spreadValues({}, state), { uploadProgress: action.payload });
    case "NAVIGATE_TO": {
      const newHistory = [
        ...state.navigationHistory.slice(0, state.historyIndex + 1),
        action.payload
      ];
      return __spreadProps(__spreadValues({}, state), {
        currentPath: action.payload,
        navigationHistory: newHistory,
        historyIndex: newHistory.length - 1,
        selectedItems: [],
        searchQuery: ""
      });
    }
    case "GO_BACK": {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return __spreadProps(__spreadValues({}, state), {
        currentPath: state.navigationHistory[newIndex],
        historyIndex: newIndex,
        selectedItems: [],
        searchQuery: ""
      });
    }
    case "GO_FORWARD": {
      if (state.historyIndex >= state.navigationHistory.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return __spreadProps(__spreadValues({}, state), {
        currentPath: state.navigationHistory[newIndex],
        historyIndex: newIndex,
        selectedItems: [],
        searchQuery: ""
      });
    }
    case "SET_SIDEBAR_FOLDERS":
      return __spreadProps(__spreadValues({}, state), { sidebarFolders: action.payload });
    default:
      return state;
  }
}
var FileManagerContext = createContext(null);
function FileManagerProvider({
  children,
  adapter,
  config = {}
}) {
  const mergedConfig = __spreadProps(__spreadValues({
    viewMode: "grid",
    theme: "dark",
    showSidebar: true,
    showStatusBar: true,
    showBreadcrumb: true,
    height: "700px",
    width: "100%"
  }, config), {
    rootPath: normalizeManagerPath(config.rootPath || "/")
  });
  const rootPath = mergedConfig.rootPath || "/";
  const [state, dispatch] = useReducer(fileManagerReducer, __spreadProps(__spreadValues({}, initialState), {
    currentPath: rootPath,
    viewMode: mergedConfig.viewMode || "grid",
    activeCategory: mergedConfig.initialCategory || "all",
    navigationHistory: [rootPath]
  }));
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;
  const isPathWithinRoot = useCallback((path) => {
    const normalizedPath = normalizeManagerPath(path);
    const normalizedRoot = normalizeManagerPath(mergedConfig.rootPath || "/");
    if (normalizedRoot === "/") return true;
    return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
  }, [mergedConfig.rootPath]);
  const loadFiles = useCallback(async (path) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const files = await adapterRef.current.listFiles(path);
      dispatch({ type: "SET_FILES", payload: files });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to load files"
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);
  const loadSidebarFolders = useCallback(async () => {
    try {
      const rootFiles = await adapterRef.current.listFiles(mergedConfig.rootPath || "/");
      const folders = rootFiles.filter((f) => f.isDirectory);
      dispatch({ type: "SET_SIDEBAR_FOLDERS", payload: folders });
    } catch (e) {
    }
  }, [mergedConfig.rootPath]);
  const navigateTo = useCallback(
    async (path) => {
      if (!isPathWithinRoot(path)) {
        console.warn(`Navigation to ${path} is blocked. Outside root path: ${mergedConfig.rootPath}`);
        return;
      }
      dispatch({ type: "NAVIGATE_TO", payload: path });
      await loadFiles(path);
      loadSidebarFolders();
    },
    [loadFiles, loadSidebarFolders, isPathWithinRoot, mergedConfig.rootPath]
  );
  const goBack = useCallback(() => {
    if (state.historyIndex > 0) {
      dispatch({ type: "GO_BACK" });
      const prevPath = state.navigationHistory[state.historyIndex - 1];
      loadFiles(prevPath);
    }
  }, [state.historyIndex, state.navigationHistory, loadFiles]);
  const goForward = useCallback(() => {
    if (state.historyIndex < state.navigationHistory.length - 1) {
      dispatch({ type: "GO_FORWARD" });
      const nextPath = state.navigationHistory[state.historyIndex + 1];
      loadFiles(nextPath);
    }
  }, [state.historyIndex, state.navigationHistory, loadFiles]);
  const goUp = useCallback(() => {
    const rootPath2 = mergedConfig.rootPath;
    if (state.currentPath === rootPath2) {
      return;
    }
    const parentPath = normalizeManagerPath(
      state.currentPath.split("/").slice(0, -1).join("/") || "/"
    );
    if (!isPathWithinRoot(parentPath)) {
      return;
    }
    if (parentPath !== state.currentPath) {
      navigateTo(parentPath);
    }
  }, [state.currentPath, navigateTo, mergedConfig.rootPath, isPathWithinRoot]);
  const refreshFiles = useCallback(async () => {
    await loadFiles(state.currentPath);
    loadSidebarFolders();
  }, [state.currentPath, loadFiles, loadSidebarFolders]);
  const createFolder = useCallback(
    async (name) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await adapterRef.current.createFolder(state.currentPath, name);
        await refreshFiles();
        dispatch({ type: "SET_MODAL", payload: null });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to create folder"
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.currentPath, refreshFiles]
  );
  const deleteItems = useCallback(
    async (items) => {
      const toDelete = items || state.selectedItems;
      if (toDelete.length === 0) return;
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await adapterRef.current.deleteItems(
          toDelete.map((i) => ({ path: i.path, isDirectory: i.isDirectory }))
        );
        dispatch({ type: "CLEAR_SELECTION" });
        dispatch({ type: "SET_MODAL", payload: null });
        await refreshFiles();
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to delete items"
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.selectedItems, refreshFiles]
  );
  const renameItemFn = useCallback(
    async (item, newName) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await adapterRef.current.renameItem(item.path, newName);
        dispatch({ type: "SET_MODAL", payload: null });
        dispatch({ type: "SET_RENAME_ITEM", payload: null });
        await refreshFiles();
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to rename item"
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [refreshFiles]
  );
  const cutItems = useCallback(
    (items) => {
      const toCut = items || state.selectedItems;
      dispatch({
        type: "SET_CLIPBOARD",
        payload: { items: toCut, operation: "cut" }
      });
    },
    [state.selectedItems]
  );
  const copyItemsFn = useCallback(
    (items) => {
      const toCopy = items || state.selectedItems;
      dispatch({
        type: "SET_CLIPBOARD",
        payload: { items: toCopy, operation: "copy" }
      });
    },
    [state.selectedItems]
  );
  const pasteItems = useCallback(async () => {
    if (!state.clipboard.operation || state.clipboard.items.length === 0) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const sourcePaths = state.clipboard.items.map((i) => i.path);
      const targetPath = state.currentPath;
      if (state.clipboard.operation === "cut") {
        await adapterRef.current.moveItems(sourcePaths, targetPath);
      } else {
        await adapterRef.current.copyItems(sourcePaths, targetPath);
      }
      dispatch({ type: "CLEAR_CLIPBOARD" });
      await refreshFiles();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to paste items"
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.clipboard, state.currentPath, refreshFiles]);
  const uploadFilesFn = useCallback(
    async (files) => {
      const progress = files.map((file) => ({
        file,
        progress: 0,
        status: "pending"
      }));
      dispatch({ type: "SET_UPLOAD_PROGRESS", payload: progress });
      try {
        await adapterRef.current.uploadFiles(state.currentPath, files, (p) => {
          dispatch({ type: "SET_UPLOAD_PROGRESS", payload: p });
        });
        await refreshFiles();
        setTimeout(() => {
          dispatch({ type: "SET_MODAL", payload: null });
          dispatch({ type: "SET_UPLOAD_PROGRESS", payload: [] });
        }, 1500);
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to upload files"
        });
      }
    },
    [state.currentPath, refreshFiles]
  );
  const downloadFile = useCallback((item) => {
    const url = adapterRef.current.getDownloadUrl(item.path);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);
  const saveFileContentFn = useCallback(
    async (path, content) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const item = await adapterRef.current.saveFileContent(path, content);
        await refreshFiles();
        return item;
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Failed to save file"
        });
        throw err;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [refreshFiles]
  );
  const selectItem = useCallback((item) => {
    dispatch({ type: "SELECT_ITEM", payload: item });
  }, []);
  const toggleSelect = useCallback((item) => {
    dispatch({ type: "TOGGLE_SELECT", payload: item });
  }, []);
  const selectAll = useCallback(() => {
    dispatch({ type: "SELECT_ALL" });
  }, []);
  const clearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);
  const setViewMode = useCallback((mode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);
  const setSort = useCallback((config2) => {
    dispatch({ type: "SET_SORT", payload: config2 });
  }, []);
  const setSearch = useCallback((query) => {
    dispatch({ type: "SET_SEARCH", payload: query });
  }, []);
  const setCategory = useCallback((category) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
  }, []);
  const openModal = useCallback((modal) => {
    if (modal === "upload") {
      dispatch({ type: "SET_UPLOAD_PROGRESS", payload: [] });
    }
    dispatch({ type: "SET_MODAL", payload: modal });
  }, []);
  const closeModal = useCallback(() => {
    dispatch({ type: "SET_MODAL", payload: null });
    dispatch({ type: "SET_PREVIEW_ITEM", payload: null });
    dispatch({ type: "SET_RENAME_ITEM", payload: null });
    dispatch({ type: "SET_UPLOAD_PROGRESS", payload: [] });
  }, []);
  const clearUploadProgress = useCallback(() => {
    dispatch({ type: "SET_UPLOAD_PROGRESS", payload: [] });
  }, []);
  const openPreview = useCallback((item) => {
    dispatch({ type: "SET_PREVIEW_ITEM", payload: item });
    dispatch({ type: "SET_MODAL", payload: "preview" });
  }, []);
  const openRename = useCallback((item) => {
    dispatch({ type: "SET_RENAME_ITEM", payload: item });
    dispatch({ type: "SET_MODAL", payload: "rename" });
  }, []);
  const value = {
    state,
    dispatch,
    adapter,
    config: mergedConfig,
    navigateTo,
    goBack,
    goForward,
    goUp,
    refreshFiles,
    createFolder,
    deleteItems,
    renameItem: renameItemFn,
    cutItems,
    copyItems: copyItemsFn,
    pasteItems,
    uploadFiles: uploadFilesFn,
    downloadFile,
    selectItem,
    toggleSelect,
    selectAll,
    setCategory,
    clearSelection,
    setViewMode,
    setSort,
    setSearch,
    openModal,
    closeModal,
    clearUploadProgress,
    openPreview,
    openRename,
    saveFileContent: saveFileContentFn
  };
  return /* @__PURE__ */ jsx(FileManagerContext.Provider, { value, children });
}
function useFileManager() {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error("useFileManager must be used within a FileManagerProvider");
  }
  return context;
}

// src/components/StatusBar/StatusBar.module.css
var StatusBar_default = {};
var styles = Object.keys(StatusBar_default).length > 0 ? StatusBar_default : {
  statusBar: "statusBar",
  statusLeft: "statusLeft",
  statusRight: "statusRight",
  statusItem: "statusItem",
  errorBanner: "errorBanner",
  errorDismiss: "errorDismiss"
};
function StatusBar() {
  const { state } = useFileManager();
  const fileCount = state.files.filter((f) => !f.isDirectory).length;
  const folderCount = state.files.filter((f) => f.isDirectory).length;
  const selectedCount = state.selectedItems.length;
  return /* @__PURE__ */ jsxs("div", { className: styles.statusBar, children: [
    /* @__PURE__ */ jsxs("div", { className: styles.statusLeft, children: [
      /* @__PURE__ */ jsxs("span", { className: styles.statusItem, children: [
        folderCount,
        " folder",
        folderCount !== 1 ? "s" : "",
        ", ",
        fileCount,
        " file",
        fileCount !== 1 ? "s" : ""
      ] }),
      selectedCount > 0 && /* @__PURE__ */ jsxs("span", { className: styles.statusItem, children: [
        selectedCount,
        " selected"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles.statusRight, children: /* @__PURE__ */ jsx("span", { className: styles.statusItem, children: state.currentPath }) })
  ] });
}
function ErrorBanner() {
  const { state, dispatch } = useFileManager();
  if (!state.error) return null;
  return /* @__PURE__ */ jsxs("div", { className: styles.errorBanner, children: [
    /* @__PURE__ */ jsxs("span", { children: [
      "\u26A0 ",
      state.error
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: styles.errorDismiss,
        onClick: () => dispatch({ type: "SET_ERROR", payload: null }),
        children: "Dismiss"
      }
    )
  ] });
}
var defaultProps = {
  size: 20,
  color: "currentColor"
};
var FolderIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: /* @__PURE__ */ jsx("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", fill: "rgba(251, 191, 36, 0.2)", stroke: "rgb(251, 191, 36)" }) });
var FolderOpenIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M5 19a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v1", fill: "rgba(251, 191, 36, 0.2)", stroke: "rgb(251, 191, 36)" }),
  /* @__PURE__ */ jsx("path", { d: "M20 12H8l-4 8h16l4-8z", fill: "rgba(251, 191, 36, 0.15)", stroke: "rgb(251, 191, 36)" })
] });
var FileIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  /* @__PURE__ */ jsx("polyline", { points: "14 2 14 8 20 8" })
] });
var ImageIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2", stroke: "rgb(59, 130, 246)" }),
  /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5", stroke: "rgb(59, 130, 246)" }),
  /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21", stroke: "rgb(59, 130, 246)" })
] });
var VideoIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", stroke: "rgb(239, 68, 68)" }),
  /* @__PURE__ */ jsx("polygon", { points: "10 8 16 12 10 16 10 8", fill: "rgba(239, 68, 68, 0.3)", stroke: "rgb(239, 68, 68)" })
] });
var AudioIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M9 18V5l12-2v13", stroke: "rgb(168, 85, 247)" }),
  /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "3", fill: "rgba(168, 85, 247, 0.3)", stroke: "rgb(168, 85, 247)" }),
  /* @__PURE__ */ jsx("circle", { cx: "18", cy: "16", r: "3", fill: "rgba(168, 85, 247, 0.3)", stroke: "rgb(168, 85, 247)" })
] });
var PdfIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", stroke: "rgb(239, 68, 68)" }),
  /* @__PURE__ */ jsx("polyline", { points: "14 2 14 8 20 8", stroke: "rgb(239, 68, 68)" }),
  /* @__PURE__ */ jsx("text", { x: "8", y: "17", fontSize: "7", fontWeight: "bold", fill: "rgb(239, 68, 68)", fontFamily: "sans-serif", children: "PDF" })
] });
var CodeIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("polyline", { points: "16 18 22 12 16 6", stroke: "rgb(34, 197, 94)" }),
  /* @__PURE__ */ jsx("polyline", { points: "8 6 2 12 8 18", stroke: "rgb(34, 197, 94)" })
] });
var ArchiveIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("polyline", { points: "21 8 21 21 3 21 3 8", stroke: "rgb(245, 158, 11)" }),
  /* @__PURE__ */ jsx("rect", { x: "1", y: "3", width: "22", height: "5", rx: "1", fill: "rgba(245, 158, 11, 0.2)", stroke: "rgb(245, 158, 11)" }),
  /* @__PURE__ */ jsx("line", { x1: "10", y1: "12", x2: "14", y2: "12", stroke: "rgb(245, 158, 11)" })
] });
var ArrowBackIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
  /* @__PURE__ */ jsx("polyline", { points: "12 19 5 12 12 5" })
] });
var ArrowForwardIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
  /* @__PURE__ */ jsx("polyline", { points: "12 5 19 12 12 19" })
] });
var ArrowUpIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
  /* @__PURE__ */ jsx("polyline", { points: "5 12 12 5 19 12" })
] });
var GridViewIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
  /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
  /* @__PURE__ */ jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
  /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" })
] });
var ListViewIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "3.01", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "3.01", y2: "12" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "3.01", y2: "18" })
] });
var UploadIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ jsx("polyline", { points: "17 8 12 3 7 8" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
] });
var DownloadIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
] });
var DeleteIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("polyline", { points: "3 6 5 6 21 6" }),
  /* @__PURE__ */ jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
  /* @__PURE__ */ jsx("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
  /* @__PURE__ */ jsx("line", { x1: "14", y1: "11", x2: "14", y2: "17" })
] });
var RenameIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
  /* @__PURE__ */ jsx("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
] });
var CopyIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
] });
var CutIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("circle", { cx: "6", cy: "6", r: "3" }),
  /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "3" }),
  /* @__PURE__ */ jsx("line", { x1: "20", y1: "4", x2: "8.12", y2: "15.88" }),
  /* @__PURE__ */ jsx("line", { x1: "14.47", y1: "14.48", x2: "20", y2: "20" }),
  /* @__PURE__ */ jsx("line", { x1: "8.12", y1: "8.12", x2: "12", y2: "12" })
] });
var PasteIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }),
  /* @__PURE__ */ jsx("rect", { x: "8", y: "2", width: "8", height: "4", rx: "1", ry: "1" })
] });
var SearchIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
] });
var CloseIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
var ChevronRightIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: /* @__PURE__ */ jsx("polyline", { points: "9 18 15 12 9 6" }) });
var NewFolderIcon = ({ size = defaultProps.size, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", fill: "rgba(251, 191, 36, 0.2)", stroke: "rgb(251, 191, 36)" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "11", x2: "12", y2: "17", stroke: "rgb(251, 191, 36)" }),
  /* @__PURE__ */ jsx("line", { x1: "9", y1: "14", x2: "15", y2: "14", stroke: "rgb(251, 191, 36)" })
] });
var RefreshIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("polyline", { points: "23 4 23 10 17 10" }),
  /* @__PURE__ */ jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
] });
var HomeIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: [
  /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
] });
var CheckIcon = ({ size = defaultProps.size, color = defaultProps.color, className }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) });
var EmptyIcon = ({ size = 80, className }) => /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 80 80", fill: "none", className, children: [
  /* @__PURE__ */ jsx("rect", { x: "15", y: "10", width: "50", height: "60", rx: "4", stroke: "currentColor", strokeWidth: "2", strokeDasharray: "4 4", opacity: "0.3" }),
  /* @__PURE__ */ jsx("path", { d: "M35 35 L45 45 M45 35 L35 45", stroke: "currentColor", strokeWidth: "2", opacity: "0.3" }),
  /* @__PURE__ */ jsx("text", { x: "40", y: "65", textAnchor: "middle", fontSize: "8", fill: "currentColor", opacity: "0.4", children: "Empty" })
] });
function getFileIcon(item, size = 20) {
  var _a;
  if (item.isDirectory) return /* @__PURE__ */ jsx(FolderIcon, { size });
  const mime = item.mimeType || "";
  const ext = ((_a = item.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
  if (mime.startsWith("image/")) return /* @__PURE__ */ jsx(ImageIcon, { size });
  if (mime.startsWith("video/")) return /* @__PURE__ */ jsx(VideoIcon, { size });
  if (mime.startsWith("audio/")) return /* @__PURE__ */ jsx(AudioIcon, { size });
  if (mime === "application/pdf" || ext === "pdf") return /* @__PURE__ */ jsx(PdfIcon, { size });
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "h", "css", "html", "json", "xml", "yml", "yaml", "md", "sh", "bat", "ps1"].includes(ext)) return /* @__PURE__ */ jsx(CodeIcon, { size });
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) return /* @__PURE__ */ jsx(ArchiveIcon, { size });
  return /* @__PURE__ */ jsx(FileIcon, { size });
}

// src/components/Breadcrumb/Breadcrumb.module.css
var Breadcrumb_default = {};
var styles2 = Object.keys(Breadcrumb_default).length > 0 ? Breadcrumb_default : {
  breadcrumb: "breadcrumb",
  crumb: "crumb",
  crumbActive: "crumbActive",
  separator: "separator"
};
function Breadcrumb() {
  const { state, config, navigateTo } = useFileManager();
  const rootPath = config.rootPath || "/";
  const parts = state.currentPath.split("/").filter(Boolean);
  const rootParts = rootPath.split("/").filter(Boolean);
  const crumbs = [
    { label: rootPath === "/" ? "Root" : rootParts[rootParts.length - 1] || "Root", path: rootPath },
    ...parts.slice(rootParts.length).map((part, i) => {
      const pathIndex = rootParts.length + i;
      return {
        label: part,
        path: "/" + parts.slice(0, pathIndex + 1).join("/")
      };
    })
  ];
  return /* @__PURE__ */ jsx("div", { className: styles2.breadcrumb, children: crumbs.map((crumb, idx) => {
    const isLast = idx === crumbs.length - 1;
    return /* @__PURE__ */ jsxs(React2.Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: isLast ? styles2.crumbActive : styles2.crumb,
          onClick: () => !isLast && navigateTo(crumb.path),
          children: [
            idx === 0 && /* @__PURE__ */ jsx(HomeIcon, { size: 14 }),
            crumb.label
          ]
        }
      ),
      !isLast && /* @__PURE__ */ jsx("span", { className: styles2.separator, children: /* @__PURE__ */ jsx(ChevronRightIcon, { size: 12 }) })
    ] }, crumb.path);
  }) });
}

// src/components/ContextMenu/ContextMenu.module.css
var ContextMenu_default = {};
var styles3 = Object.keys(ContextMenu_default).length > 0 ? ContextMenu_default : {
  contextMenuPortal: "contextMenuPortal",
  contextMenuBackdrop: "contextMenuBackdrop",
  menu: "menu",
  menuItem: "menuItem",
  menuItemDanger: "menuItemDanger",
  menuItemIcon: "menuItemIcon",
  menuItemLabel: "menuItemLabel",
  menuItemShortcut: "menuItemShortcut",
  menuSeparator: "menuSeparator"
};
function ContextMenu({ position, item, onClose }) {
  const menuRef = useRef(null);
  const {
    config,
    state,
    navigateTo,
    openPreview,
    openRename,
    openModal,
    cutItems,
    copyItems,
    pasteItems,
    downloadFile,
    selectItem
  } = useFileManager();
  const hasClipboard = state.clipboard.items.length > 0;
  const isSelectionMode = config.selectionMode === true;
  const theme = config.theme || "dark";
  const selectCount = item && state.selectedItems.some((selected) => selected.id === item.id) ? state.selectedItems.length : item ? 1 : state.selectedItems.length;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const handlePointerDown = (event) => {
      var _a;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if ((_a = menuRef.current) == null ? void 0 : _a.contains(target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onClose]);
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (rect.right > vw) {
        menuRef.current.style.left = `${position.x - rect.width}px`;
      }
      if (rect.bottom > vh) {
        menuRef.current.style.top = `${position.y - rect.height}px`;
      }
    }
  }, [position]);
  const handleAction = (action) => {
    action();
    onClose();
  };
  const selectAndDelete = () => {
    if (!item) return;
    selectItem(item);
    onClose();
    openModal("delete");
  };
  const handleSelect = () => {
    if (!config.onFileSelect) return;
    const items = item && state.selectedItems.some((selected) => selected.id === item.id) ? state.selectedItems : item ? [item] : state.selectedItems;
    if (items.length > 0) {
      config.onFileSelect(items);
    }
  };
  const menu = /* @__PURE__ */ jsxs(
    "div",
    {
      "data-fm-root": "true",
      "data-fm-context-menu": "true",
      "data-fm-theme": theme,
      className: styles3.contextMenuPortal,
      children: [
        /* @__PURE__ */ jsx("div", { className: styles3.contextMenuBackdrop, onClick: onClose, onContextMenu: (e) => {
          e.preventDefault();
          onClose();
        } }),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: menuRef,
            className: styles3.menu,
            style: { left: position.x, top: position.y },
            children: item ? /* @__PURE__ */ jsxs(Fragment, { children: [
              item.isDirectory && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => navigateTo(item.path)),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(FolderOpenIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Open" })
                  ]
                }
              ),
              !item.isDirectory && isSelectionMode && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(handleSelect),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(CheckIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsxs("span", { className: styles3.menuItemLabel, children: [
                      "Select (",
                      selectCount,
                      ")"
                    ] })
                  ]
                }
              ),
              !item.isDirectory && isPreviewable(item.mimeType, item.name) && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => openPreview(item)),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(FolderOpenIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Preview" })
                  ]
                }
              ),
              !item.isDirectory && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => downloadFile(item)),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(DownloadIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Download" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: styles3.menuSeparator }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => cutItems([item])),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(CutIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Cut" }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemShortcut, children: "Ctrl+X" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => copyItems([item])),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(CopyIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Copy" }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemShortcut, children: "Ctrl+C" })
                  ]
                }
              ),
              hasClipboard && /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(pasteItems),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(PasteIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Paste" }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemShortcut, children: "Ctrl+V" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: styles3.menuSeparator }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => openRename(item)),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(RenameIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Rename" }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemShortcut, children: "F2" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItemDanger,
                  onClick: () => {
                    selectAndDelete();
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(DeleteIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Delete" }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemShortcut, children: "Del" })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => openModal("newFolder")),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(NewFolderIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "New Folder" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: styles3.menuItem,
                  onClick: () => handleAction(() => openModal("upload")),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(UploadIcon, { size: 16 }) }),
                    /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Upload Files" })
                  ]
                }
              ),
              hasClipboard && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: styles3.menuSeparator }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: styles3.menuItem,
                    onClick: () => handleAction(pasteItems),
                    children: [
                      /* @__PURE__ */ jsx("span", { className: styles3.menuItemIcon, children: /* @__PURE__ */ jsx(PasteIcon, { size: 16 }) }),
                      /* @__PURE__ */ jsx("span", { className: styles3.menuItemLabel, children: "Paste" }),
                      /* @__PURE__ */ jsx("span", { className: styles3.menuItemShortcut, children: "Ctrl+V" })
                    ]
                  }
                )
              ] })
            ] })
          }
        )
      ]
    }
  );
  if (!mounted) {
    return null;
  }
  return createPortal(menu, document.body);
}

// src/components/Modals/Modals.module.css
var Modals_default = {};

// src/components/Modals/modalClassNames.ts
var modalClassNames = {
  overlay: "overlay",
  modal: "modal",
  modalLarge: "modalLarge",
  modalEditor: "modalEditor",
  modalHeader: "modalHeader",
  modalTitle: "modalTitle",
  closeBtn: "closeBtn",
  modalBody: "modalBody",
  modalBodyEditor: "modalBodyEditor",
  modalFooter: "modalFooter",
  btn: "btn",
  btnPrimary: "btnPrimary",
  btnDanger: "btnDanger",
  inputGroup: "inputGroup",
  inputLabel: "inputLabel",
  input: "input",
  saveAsInputRow: "saveAsInputRow",
  saveAsExtension: "saveAsExtension",
  dropZone: "dropZone",
  dropZoneActive: "dropZoneActive",
  dropZoneIcon: "dropZoneIcon",
  dropZoneText: "dropZoneText",
  dropZoneSubtext: "dropZoneSubtext",
  dropZoneBrowse: "dropZoneBrowse",
  fileQueue: "fileQueue",
  fileQueueItem: "fileQueueItem",
  fileQueueInfo: "fileQueueInfo",
  fileQueueName: "fileQueueName",
  fileQueueSize: "fileQueueSize",
  progressBar: "progressBar",
  progressFill: "progressFill",
  progressFillSuccess: "progressFillSuccess",
  progressFillError: "progressFillError",
  fileQueueRemove: "fileQueueRemove",
  statusIcon: "statusIcon",
  previewContainer: "previewContainer",
  previewContainerEditor: "previewContainerEditor",
  filerobotEditorHost: "filerobotEditorHost",
  previewImage: "previewImage",
  previewVideo: "previewVideo",
  previewAudio: "previewAudio",
  previewIframe: "previewIframe",
  previewInfo: "previewInfo",
  previewInfoLabel: "previewInfoLabel",
  previewInfoValue: "previewInfoValue",
  deleteMessage: "deleteMessage",
  deleteList: "deleteList",
  deleteListItem: "deleteListItem",
  imagePreviewWrapper: "imagePreviewWrapper",
  editorWrapper: "editorWrapper"
};
var styles4 = Object.keys(Modals_default).length > 0 ? Modals_default : modalClassNames;
function DeleteModal() {
  const { state, closeModal, deleteItems } = useFileManager();
  const items = state.selectedItems;
  if (items.length === 0) return null;
  const handleDelete = async () => {
    await deleteItems();
  };
  return /* @__PURE__ */ jsx("div", { className: styles4.overlay, onClick: closeModal, children: /* @__PURE__ */ jsxs("div", { className: styles4.modal, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles4.modalHeader, children: [
      /* @__PURE__ */ jsx("span", { className: styles4.modalTitle, children: "Delete Confirmation" }),
      /* @__PURE__ */ jsx("button", { className: styles4.closeBtn, onClick: closeModal, children: /* @__PURE__ */ jsx(CloseIcon, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles4.modalBody, children: [
      /* @__PURE__ */ jsxs("div", { className: styles4.deleteMessage, children: [
        "Are you sure you want to delete ",
        items.length === 1 ? "this item" : `these ${items.length} items`,
        "? This action cannot be undone."
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles4.deleteList, children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: styles4.deleteListItem, children: [
        getFileIcon(item, 16),
        /* @__PURE__ */ jsx("span", { children: item.name })
      ] }, item.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles4.modalFooter, children: [
      /* @__PURE__ */ jsx("button", { className: styles4.btn, onClick: closeModal, children: "Cancel" }),
      /* @__PURE__ */ jsxs("button", { className: styles4.btnDanger, onClick: handleDelete, children: [
        /* @__PURE__ */ jsx(DeleteIcon, { size: 16 }),
        "Delete"
      ] })
    ] })
  ] }) });
}

// src/components/FileGrid/FileGrid.module.css
var FileGrid_default = {};
var styles5 = Object.keys(FileGrid_default).length > 0 ? FileGrid_default : {
  empty: "empty",
  emptyText: "emptyText",
  emptySubtext: "emptySubtext",
  grid: "grid",
  gridItem: "gridItem",
  gridItemSelected: "gridItemSelected",
  iconWrapper: "iconWrapper",
  thumbnail: "thumbnail",
  gridFileName: "gridFileName",
  fileMeta: "fileMeta"
};
function FileGrid({ files, onContextMenu }) {
  const {
    state,
    navigateTo,
    selectItem,
    toggleSelect,
    openPreview,
    clearSelection
  } = useFileManager();
  const handleClick = (e, item) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      toggleSelect(item);
    } else {
      selectItem(item);
    }
  };
  const handleDoubleClick = (item) => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else {
      openPreview(item);
    }
  };
  const handleBackgroundClick = () => {
    clearSelection();
  };
  const handleBackgroundContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e);
  };
  if (files.length === 0) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: styles5.empty,
        onClick: handleBackgroundClick,
        onContextMenu: handleBackgroundContextMenu,
        children: [
          /* @__PURE__ */ jsx(EmptyIcon, {}),
          /* @__PURE__ */ jsx("span", { className: styles5.emptyText, children: "This folder is empty" }),
          /* @__PURE__ */ jsx("span", { className: styles5.emptySubtext, children: "Drop files here or use the Upload button" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: styles5.grid,
      onClick: handleBackgroundClick,
      onContextMenu: (e) => {
        if (e.target === e.currentTarget) {
          onContextMenu(e);
        }
      },
      children: files.map((item) => {
        var _a;
        const isSelected = state.selectedItems.some((s) => s.id === item.id);
        const isImage = (_a = item.mimeType) == null ? void 0 : _a.startsWith("image/");
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: isSelected ? styles5.gridItemSelected : styles5.gridItem,
            onClick: (e) => handleClick(e, item),
            onDoubleClick: () => handleDoubleClick(item),
            onContextMenu: (e) => {
              e.stopPropagation();
              if (!isSelected) {
                selectItem(item);
              }
              onContextMenu(e, item);
            },
            children: [
              /* @__PURE__ */ jsx("div", { className: styles5.iconWrapper, children: isImage && item.thumbnailUrl ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.thumbnailUrl,
                  alt: item.name,
                  className: styles5.thumbnail,
                  loading: "lazy"
                }
              ) : getFileIcon(item, 42) }),
              /* @__PURE__ */ jsx("span", { className: styles5.gridFileName, title: item.name, children: truncateFileName(item.name, 15) }),
              !item.isDirectory && /* @__PURE__ */ jsx("span", { className: styles5.fileMeta, children: formatFileSize(item.size) })
            ]
          },
          item.id
        );
      })
    }
  );
}

// src/components/FileList/FileList.module.css
var FileList_default = {};
var styles6 = Object.keys(FileList_default).length > 0 ? FileList_default : {
  sortIndicator: "sortIndicator",
  listEmpty: "listEmpty",
  listEmptyText: "listEmptyText",
  listEmptySubtext: "listEmptySubtext",
  fileListTable: "fileListTable",
  fileListHeader: "fileListHeader",
  fileListHeaderRow: "fileListHeaderRow",
  fileListBody: "fileListBody",
  fileListRow: "fileListRow",
  fileListRowSelected: "fileListRowSelected",
  checkbox: "checkbox",
  checkboxHeaderCell: "checkboxHeaderCell",
  headerCell: "headerCell",
  headerCellActive: "headerCellActive",
  listCheckboxCell: "listCheckboxCell",
  listNameCell: "listNameCell",
  listFileName: "listFileName",
  listSizeCell: "listSizeCell",
  listTypeCell: "listTypeCell",
  listDateCell: "listDateCell",
  listNameHeaderCell: "listNameHeaderCell",
  listSizeHeaderCell: "listSizeHeaderCell",
  listTypeHeaderCell: "listTypeHeaderCell",
  listDateHeaderCell: "listDateHeaderCell"
};
function FileList({ files, onContextMenu }) {
  const {
    state,
    navigateTo,
    selectItem,
    toggleSelect,
    openPreview,
    clearSelection,
    setSort
  } = useFileManager();
  const handleClick = (e, item) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      toggleSelect(item);
    } else {
      selectItem(item);
    }
  };
  const handleDoubleClick = (item) => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else {
      openPreview(item);
    }
  };
  const handleSort = (field) => {
    const newOrder = state.sortConfig.field === field && state.sortConfig.order === "asc" ? "desc" : "asc";
    setSort({ field, order: newOrder });
  };
  const getSortIndicator = (field) => {
    if (state.sortConfig.field !== field) return null;
    return /* @__PURE__ */ jsx("span", { className: styles6.sortIndicator, children: state.sortConfig.order === "asc" ? "\u25B2" : "\u25BC" });
  };
  const handleBackgroundContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e);
  };
  if (files.length === 0) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: styles6.listEmpty,
        onClick: () => clearSelection(),
        onContextMenu: handleBackgroundContextMenu,
        children: [
          /* @__PURE__ */ jsx(EmptyIcon, {}),
          /* @__PURE__ */ jsx("span", { className: styles6.listEmptyText, children: "This folder is empty" }),
          /* @__PURE__ */ jsx("span", { className: styles6.listEmptySubtext, children: "Drop files here or use the Upload button" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: styles6.fileListTable, role: "table", children: [
    /* @__PURE__ */ jsx("div", { className: styles6.fileListHeader, role: "rowgroup", children: /* @__PURE__ */ jsxs("div", { className: styles6.fileListHeaderRow, role: "row", children: [
      /* @__PURE__ */ jsx("div", { className: styles6.checkboxHeaderCell, role: "columnheader", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          className: styles6.checkbox,
          checked: state.selectedItems.length === files.length && files.length > 0,
          onChange: (e) => {
            if (e.target.checked) {
              files.forEach((f) => toggleSelect(f));
            } else {
              clearSelection();
            }
          }
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: styles6.listNameHeaderCell, role: "columnheader", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: state.sortConfig.field === "name" ? styles6.headerCellActive : styles6.headerCell,
          onClick: () => handleSort("name"),
          children: [
            "Name ",
            getSortIndicator("name")
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: styles6.listSizeHeaderCell, role: "columnheader", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: state.sortConfig.field === "size" ? styles6.headerCellActive : styles6.headerCell,
          onClick: () => handleSort("size"),
          children: [
            "Size ",
            getSortIndicator("size")
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: styles6.listTypeHeaderCell, role: "columnheader", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: state.sortConfig.field === "type" ? styles6.headerCellActive : styles6.headerCell,
          onClick: () => handleSort("type"),
          children: [
            "Type ",
            getSortIndicator("type")
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: styles6.listDateHeaderCell, role: "columnheader", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: state.sortConfig.field === "modifiedAt" ? styles6.headerCellActive : styles6.headerCell,
          onClick: () => handleSort("modifiedAt"),
          children: [
            "Modified ",
            getSortIndicator("modifiedAt")
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: styles6.fileListBody, role: "rowgroup", children: files.map((item) => {
      const isSelected = state.selectedItems.some((s) => s.id === item.id);
      const rowClassName = isSelected ? `${styles6.fileListRow} ${styles6.fileListRowSelected}` : styles6.fileListRow;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: rowClassName,
          role: "row",
          onClick: (e) => handleClick(e, item),
          onDoubleClick: () => handleDoubleClick(item),
          onContextMenu: (e) => {
            e.stopPropagation();
            if (!isSelected) selectItem(item);
            onContextMenu(e, item);
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: styles6.listCheckboxCell, role: "cell", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: styles6.checkbox,
                checked: isSelected,
                onChange: () => toggleSelect(item),
                onClick: (e) => e.stopPropagation()
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: styles6.listNameCell, role: "cell", children: [
              getFileIcon(item, 18),
              /* @__PURE__ */ jsx("span", { className: styles6.listFileName, children: item.name })
            ] }),
            /* @__PURE__ */ jsx("div", { className: styles6.listSizeCell, role: "cell", children: item.isDirectory ? "\u2014" : formatFileSize(item.size) }),
            /* @__PURE__ */ jsx("div", { className: styles6.listTypeCell, role: "cell", children: item.isDirectory ? "Folder" : getFileExtension(item.name).toUpperCase() || "\u2014" }),
            /* @__PURE__ */ jsx("div", { className: styles6.listDateCell, role: "cell", children: formatDate(item.modifiedAt) })
          ]
        },
        item.id
      );
    }) })
  ] });
}
var styles7 = Object.keys(Modals_default).length > 0 ? Modals_default : modalClassNames;
function InputModal() {
  const { state, closeModal, createFolder, renameItem } = useFileManager();
  const isRename = state.activeModal === "rename";
  const item = state.renameItem;
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (isRename && item) {
      setValue(item.name);
    } else {
      setValue("");
    }
    setTimeout(() => {
      var _a, _b;
      (_a = inputRef.current) == null ? void 0 : _a.focus();
      (_b = inputRef.current) == null ? void 0 : _b.select();
    }, 100);
  }, [isRename, item]);
  const validate = (name) => {
    if (!name.trim()) return "Name cannot be empty";
    if (/[<>:"/\\|?*]/.test(name)) return "Name contains invalid characters";
    return "";
  };
  const handleSubmit = async () => {
    const err = validate(value);
    if (err) {
      setError(err);
      return;
    }
    if (isRename && item) {
      await renameItem(item, value.trim());
    } else {
      await createFolder(value.trim());
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      closeModal();
    }
  };
  return /* @__PURE__ */ jsx("div", { className: styles7.overlay, onClick: closeModal, children: /* @__PURE__ */ jsxs("div", { className: styles7.modal, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles7.modalHeader, children: [
      /* @__PURE__ */ jsx("span", { className: styles7.modalTitle, children: isRename ? "Rename" : "New Folder" }),
      /* @__PURE__ */ jsx("button", { className: styles7.closeBtn, onClick: closeModal, children: /* @__PURE__ */ jsx(CloseIcon, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles7.modalBody, children: /* @__PURE__ */ jsxs("div", { className: styles7.inputGroup, children: [
      /* @__PURE__ */ jsx("label", { className: styles7.inputLabel, children: isRename ? "New name" : "Folder name" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "text",
          className: styles7.input,
          value,
          onChange: (e) => {
            setValue(e.target.value);
            setError("");
          },
          onKeyDown: handleKeyDown,
          placeholder: isRename ? "Enter new name" : "Enter folder name"
        }
      ),
      error && /* @__PURE__ */ jsx("span", { style: { color: "var(--fm-danger)", fontSize: "var(--fm-font-size-xs)" }, children: error })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: styles7.modalFooter, children: [
      /* @__PURE__ */ jsx("button", { className: styles7.btn, onClick: closeModal, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles7.btnPrimary,
          onClick: handleSubmit,
          disabled: !value.trim(),
          children: isRename ? "Rename" : "Create"
        }
      )
    ] })
  ] }) });
}
var styles8 = Object.keys(Modals_default).length > 0 ? Modals_default : modalClassNames;
var filerobotGlobalScope = globalThis;
filerobotGlobalScope.React = React2;
var FilerobotImageEditor = dynamic(
  () => import('react-filerobot-image-editor'),
  { ssr: false }
);
function getMonacoLanguage(ext) {
  const map = {
    "js": "javascript",
    "jsx": "javascript",
    "ts": "typescript",
    "tsx": "typescript",
    "json": "json",
    "html": "html",
    "css": "css",
    "md": "markdown",
    "xml": "xml",
    "yaml": "yaml",
    "yml": "yaml",
    "py": "python",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "h": "cpp",
    "sh": "shell",
    "sql": "sql",
    "php": "php",
    "rb": "ruby",
    "go": "go"
  };
  return map[ext.toLowerCase()] || "plaintext";
}
function PreviewModal() {
  var _a, _b, _c;
  const { state, dispatch, closeModal, adapter, config, downloadFile, saveFileContent } = useFileManager();
  const item = state.previewItem;
  const [textContent, setTextContent] = useState(null);
  const [originalText, setOriginalText] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isSaveAs, setIsSaveAs] = useState(false);
  const [saveAsBaseName, setSaveAsBaseName] = useState("");
  const [previewVersion, setPreviewVersion] = useState(0);
  useEffect(() => {
    if (!isImageEditorOpen) {
      return;
    }
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        return String(arg);
      }).join(" ");
      const isInvalidPropWarning = message.includes("React does not recognize the") || message.includes("non-boolean attribute");
      if (isInvalidPropWarning) {
        return;
      }
      originalConsoleError(...args);
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, [isImageEditorOpen]);
  useEffect(() => {
    if (!item) return;
    const ext2 = getFileExtension(item.name);
    const textExts = ["txt", "md", "json", "xml", "csv", "log", "js", "ts", "jsx", "tsx", "css", "html", "py", "java", "cpp", "c", "h", "sh", "yml", "yaml"];
    if (textExts.includes(ext2)) {
      adapter.downloadFile(item.path).then((blob) => blob.text()).then((text) => {
        setTextContent(text);
        setOriginalText(text);
      }).catch(() => setTextContent("Failed to load file content"));
    }
    setSaveAsBaseName(getFileBaseName(item.name));
  }, [item, adapter]);
  if (!item) return null;
  const saveAsExtension = getFileExtension(item.name);
  const getSaveAsFullName = (baseName) => saveAsExtension ? `${baseName}.${saveAsExtension}` : baseName;
  const saveAsFullName = getSaveAsFullName(saveAsBaseName.trim());
  const openSaveAs = () => {
    setSaveAsBaseName(getFileBaseName(item.name));
    setIsSaveAs(true);
  };
  const handleSaveAsBaseNameChange = (value) => {
    let next = value.replace(/[/\\]/g, "");
    if (saveAsExtension && next.toLowerCase().endsWith(`.${saveAsExtension}`)) {
      next = next.slice(0, -(saveAsExtension.length + 1));
    }
    setSaveAsBaseName(next);
  };
  const editorTheme = config.theme === "light" ? {
    palette: {
      "bg-primary": "#ffffff",
      "bg-secondary": "#f8fafc",
      "bg-hover": "#f1f5f9",
      "bg-primary-light": "#eef2ff",
      "bg-primary-hover": "#eef2ff",
      "bg-primary-active": "#e8f0ff",
      "bg-primary-stateless": "#cbd5e1",
      "bg-stateless": "#ffffff",
      "bg-active": "#eef2ff",
      "bg-tooltip": "#0f172a",
      "txt-primary": "#111827",
      "txt-placeholder": "#64748b",
      "txt-secondary": "#475569",
      "icon-primary": "#334155",
      "icons-primary-hover": "#4f46e5",
      "icons-secondary": "#64748b",
      "icons-secondary-hover": "#475569",
      "icons-muted": "#94a3b8",
      "icons-invert": "#ffffff",
      "btn-primary-text": "#ffffff",
      "btn-disabled-text": "#94a3b8",
      "link-stateless": "#4f46e5",
      "link-hover": "#4338ca",
      "link-active": "#3730a3",
      "borders-primary": "#dbe3ef",
      "borders-primary-hover": "#94a3b8",
      "borders-secondary": "#dbe3ef",
      "borders-button": "#cbd5e1",
      "borders-item": "#cbd5e1",
      "borders-base-light": "#e0e7ff",
      "borders-base-medium": "#c7d2fe",
      "border-primary-stateless": "#cbd5e1",
      "accent-primary": "#4f46e5",
      "accent-primary-hover": "#4338ca",
      "accent-primary-active": "#4338ca",
      "accent-primary-disabled": "#a5b4fc",
      "accent-stateless": "#4f46e5",
      "active-secondary": "#ffffff",
      "active-secondary-hover": "rgba(79, 70, 229, 0.08)",
      "light-shadow": "rgba(15, 23, 42, 0.12)",
      "medium-shadow": "rgba(15, 23, 42, 0.18)",
      "large-shadow": "rgba(15, 23, 42, 0.24)",
      "x-large-shadow": "rgba(15, 23, 42, 0.35)"
    },
    typography: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    }
  } : {
    palette: {
      "bg-primary": "#0f172a",
      "bg-secondary": "#111827",
      "bg-hover": "#1f2937",
      "bg-primary-light": "#1e293b",
      "bg-primary-hover": "#253044",
      "bg-primary-active": "#1e293b",
      "bg-primary-stateless": "#334155",
      "bg-stateless": "#1f2937",
      "bg-active": "#312e81",
      "bg-tooltip": "#020617",
      "txt-primary": "#e5e7eb",
      "txt-placeholder": "#94a3b8",
      "txt-secondary": "#cbd5e1",
      "icon-primary": "#e2e8f0",
      "icons-primary-hover": "#c7d2fe",
      "icons-secondary": "#94a3b8",
      "icons-secondary-hover": "#e2e8f0",
      "icons-muted": "#64748b",
      "icons-invert": "#ffffff",
      "btn-primary-text": "#ffffff",
      "btn-disabled-text": "#64748b",
      "link-stateless": "#a5b4fc",
      "link-hover": "#c7d2fe",
      "link-active": "#e0e7ff",
      "borders-primary": "#334155",
      "borders-primary-hover": "#475569",
      "borders-secondary": "#243041",
      "borders-button": "#475569",
      "borders-item": "#334155",
      "borders-base-light": "#312e81",
      "borders-base-medium": "#4338ca",
      "border-primary-stateless": "#334155",
      "accent-primary": "#818cf8",
      "accent-primary-hover": "#6366f1",
      "accent-primary-active": "#a5b4fc",
      "accent-primary-disabled": "#4f46e5",
      "accent-stateless": "#818cf8",
      "active-secondary": "#ffffff",
      "active-secondary-hover": "rgba(165, 180, 252, 0.08)",
      "light-shadow": "rgba(0, 0, 0, 0.45)",
      "medium-shadow": "rgba(0, 0, 0, 0.55)",
      "large-shadow": "rgba(0, 0, 0, 0.65)",
      "x-large-shadow": "rgba(0, 0, 0, 0.78)"
    },
    typography: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    }
  };
  const rawPreviewUrl = adapter.getPreviewUrl(item.path);
  const previewUrl = `${rawPreviewUrl}${rawPreviewUrl.includes("?") ? "&" : "?"}v=${previewVersion}`;
  const ext = getFileExtension(item.name);
  const isImage = (_a = item.mimeType) == null ? void 0 : _a.startsWith("image/");
  const isVideo = (_b = item.mimeType) == null ? void 0 : _b.startsWith("video/");
  const isAudio = (_c = item.mimeType) == null ? void 0 : _c.startsWith("audio/");
  const isPdf = item.mimeType === "application/pdf" || ext === "pdf";
  const isText = textContent !== null;
  const isDirty = originalText !== null && textContent !== originalText;
  const handleSaveText = async () => {
    if (!textContent || isSaving) return;
    const confirmed = window.confirm(
      `Are you sure you want to save changes to "${item.name}"?

This will overwrite the existing file.`
    );
    if (!confirmed) return;
    setIsSaving(true);
    try {
      await saveFileContent(item.path, textContent);
      setOriginalText(textContent);
      setIsSaveAs(false);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save file. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleSaveAsText = async () => {
    if (!textContent || isSaving || !saveAsBaseName.trim()) return;
    setIsSaving(true);
    try {
      const parentPath = item.path.substring(0, item.path.lastIndexOf(item.name));
      const newPath = parentPath + saveAsFullName;
      await saveFileContent(newPath, textContent);
      setIsSaveAs(false);
      closeModal();
    } catch (error) {
      console.error("Save As failed", error);
      alert("Failed to save file. Please try again.");
      setIsSaving(false);
    }
  };
  const handleSaveAsImage = async () => {
    if (isSaving || !saveAsBaseName.trim()) return;
    setIsSaving(true);
    try {
      const blob = await adapter.downloadFile(item.path);
      const parentPath = item.path.substring(0, item.path.lastIndexOf(item.name));
      const newPath = parentPath + saveAsFullName;
      await saveFileContent(newPath, blob);
      setIsSaveAs(false);
      closeModal();
    } catch (error) {
      console.error("Save As failed", error);
      alert("Failed to save file. Please try again.");
      setIsSaving(false);
    }
  };
  const handleSaveImage = async (editedImageObject) => {
    if (!isSaveAs) {
      const confirmed = window.confirm(
        `Are you sure you want to save changes to "${item.name}"?

This will overwrite the existing image.`
      );
      if (!confirmed) {
        setIsImageEditorOpen(false);
        return;
      }
    }
    setIsSaving(true);
    try {
      const { imageBase64, imageCanvas, mimeType } = editedImageObject != null ? editedImageObject : {};
      let blob;
      if (imageBase64) {
        const res = await fetch(imageBase64);
        blob = await res.blob();
      } else if (imageCanvas instanceof HTMLCanvasElement) {
        blob = await new Promise((resolve, reject) => {
          imageCanvas.toBlob(
            (canvasBlob) => {
              if (canvasBlob) {
                resolve(canvasBlob);
                return;
              }
              reject(new Error("Failed to generate image blob from canvas"));
            },
            mimeType || item.mimeType || "image/png"
          );
        });
      } else {
        throw new Error("No editable image data returned from the editor");
      }
      if (isSaveAs && saveAsBaseName.trim()) {
        const parentPath = item.path.substring(0, item.path.lastIndexOf(item.name));
        const newPath = parentPath + saveAsFullName;
        await saveFileContent(newPath, blob);
        setIsSaveAs(false);
        closeModal();
      } else {
        const savedItem = await saveFileContent(item.path, blob);
        dispatch({ type: "SET_PREVIEW_ITEM", payload: savedItem });
        setPreviewVersion((prev) => prev + 1);
        setIsSaveAs(false);
        setIsImageEditorOpen(false);
      }
    } catch (error) {
      console.error("Failed to save image", error);
      alert("Failed to save image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: styles8.overlay,
      style: isImageEditorOpen ? { pointerEvents: "none" } : void 0,
      onMouseDown: (e) => {
        if (e.target === e.currentTarget && !isImageEditorOpen) closeModal();
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: `${styles8.modalLarge} ${isImageEditorOpen ? styles8.modalEditor : ""}`,
          style: isImageEditorOpen ? { pointerEvents: "none" } : void 0,
          onClick: (e) => e.stopPropagation(),
          children: [
            !isImageEditorOpen && /* @__PURE__ */ jsxs("div", { className: styles8.modalHeader, children: [
              /* @__PURE__ */ jsx("span", { className: styles8.modalTitle, children: isSaveAs ? "Save As Name" : `${item.name} ${isDirty ? "*" : ""}` }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: styles8.closeBtn,
                  onClick: closeModal,
                  title: "Close",
                  children: /* @__PURE__ */ jsx(CloseIcon, { size: 18 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `${styles8.modalBody} ${isImageEditorOpen ? styles8.modalBodyEditor : ""}`,
                style: { display: "flex", flexDirection: "column" },
                children: [
                  isSaveAs && !isImageEditorOpen && /* @__PURE__ */ jsxs("div", { className: styles8.saveAsInputRow, children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        autoFocus: true,
                        "aria-label": "Save As Name",
                        className: styles8.input,
                        value: saveAsBaseName,
                        onChange: (e) => handleSaveAsBaseNameChange(e.target.value)
                      }
                    ),
                    saveAsExtension && /* @__PURE__ */ jsxs("span", { className: styles8.saveAsExtension, children: [
                      ".",
                      saveAsExtension
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `${styles8.previewContainer} ${isImageEditorOpen ? styles8.previewContainerEditor : ""}`,
                      style: {
                        flex: isSaveAs && isImage && !isImageEditorOpen ? "0 0 auto" : isImageEditorOpen ? "1 1 auto" : 1,
                        minHeight: isImageEditorOpen ? 0 : isSaveAs && isImage ? 0 : 400,
                        display: isSaveAs && isImage && !isImageEditorOpen ? "none" : void 0
                      },
                      children: [
                        isImage && !isImageEditorOpen && !isSaveAs && /* @__PURE__ */ jsx("div", { className: styles8.imagePreviewWrapper, children: /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: previewUrl,
                            alt: item.name,
                            className: styles8.previewImage
                          }
                        ) }),
                        isImageEditorOpen && /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: styles8.filerobotEditorHost,
                            "data-fm-filerobot-editor": "true",
                            style: { pointerEvents: "auto" },
                            children: /* @__PURE__ */ jsx(
                              FilerobotImageEditor,
                              {
                                source: previewUrl,
                                theme: editorTheme,
                                observePluginContainerSize: true,
                                onSave: handleSaveImage,
                                onClose: () => {
                                  setIsImageEditorOpen(false);
                                  setIsSaveAs(false);
                                },
                                closeAfterSave: true,
                                annotationsCommon: {
                                  fill: "#ff0000"
                                },
                                Text: { text: "Add Text" },
                                savingPixelRatio: 1,
                                previewPixelRatio: 1,
                                defaultSavedImageName: isSaveAs ? saveAsFullName : item.name
                              }
                            )
                          }
                        ),
                        isVideo && /* @__PURE__ */ jsx("video", { src: previewUrl, controls: true, className: styles8.previewVideo }),
                        isAudio && /* @__PURE__ */ jsx("audio", { src: previewUrl, controls: true, className: styles8.previewAudio }),
                        isPdf && /* @__PURE__ */ jsx("iframe", { src: previewUrl, className: styles8.previewIframe, title: item.name }),
                        isText && /* @__PURE__ */ jsx("div", { className: styles8.editorWrapper, style: { width: "100%", height: "500px", border: "1px solid var(--fm-border)" }, children: /* @__PURE__ */ jsx(
                          Editor,
                          {
                            height: "100%",
                            defaultLanguage: getMonacoLanguage(ext),
                            theme: "vs-dark",
                            value: textContent,
                            onChange: (val) => setTextContent(val || ""),
                            options: {
                              minimap: { enabled: false },
                              fontSize: 14,
                              wordWrap: "on"
                            }
                          }
                        ) })
                      ]
                    }
                  ),
                  !isImageEditorOpen && !isSaveAs && /* @__PURE__ */ jsxs("div", { className: styles8.previewInfo, style: { marginTop: 16 }, children: [
                    /* @__PURE__ */ jsx("span", { className: styles8.previewInfoLabel, children: "Size" }),
                    /* @__PURE__ */ jsx("span", { className: styles8.previewInfoValue, children: formatFileSize(item.size) }),
                    /* @__PURE__ */ jsx("span", { className: styles8.previewInfoLabel, children: "Path" }),
                    /* @__PURE__ */ jsx("span", { className: styles8.previewInfoValue, children: item.path }),
                    /* @__PURE__ */ jsx("span", { className: styles8.previewInfoLabel, children: "Modified" }),
                    /* @__PURE__ */ jsx("span", { className: styles8.previewInfoValue, children: formatDate(item.modifiedAt) })
                  ] })
                ]
              }
            ),
            !isImageEditorOpen && /* @__PURE__ */ jsxs("div", { className: styles8.modalFooter, children: [
              isText && !isSaveAs && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: styles8.btnPrimary,
                    onClick: handleSaveText,
                    disabled: !isDirty || isSaving,
                    children: isSaving ? "Saving..." : "Save"
                  }
                ),
                /* @__PURE__ */ jsx("button", { className: styles8.btn, onClick: openSaveAs, children: "Save As..." })
              ] }),
              isImage && !isSaveAs && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("button", { className: styles8.btnPrimary, onClick: () => setIsImageEditorOpen(true), children: "Edit Image" }),
                /* @__PURE__ */ jsx("button", { className: styles8.btn, onClick: openSaveAs, children: "Save As..." })
              ] }),
              isSaveAs && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("button", { className: styles8.btn, onClick: () => setIsSaveAs(false), children: "Cancel" }),
                /* @__PURE__ */ jsx("div", { style: { flex: 1 } }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: styles8.btnPrimary,
                    onClick: isText ? handleSaveAsText : handleSaveAsImage,
                    disabled: isSaving || !saveAsBaseName.trim(),
                    children: isSaving ? "Saving..." : "Save As"
                  }
                )
              ] }),
              !isSaveAs && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { style: { flex: 1 } }),
                /* @__PURE__ */ jsx("button", { className: styles8.btn, onClick: closeModal, children: "Close" }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: styles8.btnPrimary,
                    onClick: () => downloadFile(item),
                    children: [
                      /* @__PURE__ */ jsx(DownloadIcon, { size: 16 }),
                      "Download"
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
}

// src/components/Sidebar/Sidebar.module.css
var Sidebar_default = {};
var styles9 = Object.keys(Sidebar_default).length > 0 ? Sidebar_default : {
  treeItem: "treeItem",
  treeItemActive: "treeItemActive",
  toggleIcon: "toggleIcon",
  toggleIconExpanded: "toggleIconExpanded",
  treeItemName: "treeItemName",
  childrenContainer: "childrenContainer",
  sidebar: "sidebar",
  sidebarHeader: "sidebarHeader",
  treeContainer: "treeContainer",
  rootItem: "rootItem"
};
function TreeNode({ folder, level }) {
  const { state, navigateTo, adapter } = useFileManager();
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const isActive = state.currentPath === folder.path;
  const isInPath = state.currentPath.startsWith(folder.path + "/");
  useEffect(() => {
    if (isInPath && !expanded) {
      setExpanded(true);
    }
  }, [isInPath, expanded]);
  const loadChildren = useCallback(async () => {
    if (!loaded) {
      try {
        const files = await adapter.listFiles(folder.path);
        setChildren(files.filter((f) => f.isDirectory));
        setLoaded(true);
      } catch (e) {
      }
    }
  }, [loaded, adapter, folder.path]);
  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!expanded) {
      await loadChildren();
    }
    setExpanded(!expanded);
  };
  const handleClick = () => {
    navigateTo(folder.path);
    if (!expanded) {
      loadChildren();
      setExpanded(true);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: isActive ? styles9.treeItemActive : styles9.treeItem,
        style: { paddingLeft: `${8 + level * 8}px` },
        onClick: handleClick,
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: expanded ? styles9.toggleIconExpanded : styles9.toggleIcon,
              onClick: handleToggle,
              children: /* @__PURE__ */ jsx(ChevronRightIcon, { size: 12 })
            }
          ),
          expanded ? /* @__PURE__ */ jsx(FolderOpenIcon, { size: 16 }) : /* @__PURE__ */ jsx(FolderIcon, { size: 16 }),
          /* @__PURE__ */ jsx("span", { className: styles9.treeItemName, children: folder.name })
        ]
      }
    ),
    expanded && children.length > 0 && /* @__PURE__ */ jsx("div", { className: styles9.childrenContainer, children: children.map((child) => /* @__PURE__ */ jsx(TreeNode, { folder: child, level: level + 1 }, child.id)) })
  ] });
}
function Sidebar() {
  const { state, navigateTo } = useFileManager();
  const isRootActive = state.currentPath === "/";
  return /* @__PURE__ */ jsxs("div", { className: styles9.sidebar, children: [
    /* @__PURE__ */ jsx("div", { className: styles9.sidebarHeader, children: "Explorer" }),
    /* @__PURE__ */ jsxs("div", { className: styles9.treeContainer, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: isRootActive ? styles9.treeItemActive : styles9.rootItem,
          onClick: () => navigateTo("/"),
          children: [
            /* @__PURE__ */ jsx(HomeIcon, { size: 16 }),
            /* @__PURE__ */ jsx("span", { className: styles9.treeItemName, children: "Root" })
          ]
        }
      ),
      state.sidebarFolders.map((folder) => /* @__PURE__ */ jsx(TreeNode, { folder, level: 0 }, folder.id))
    ] })
  ] });
}

// src/components/Toolbar/Toolbar.module.css
var Toolbar_default = {};
var styles10 = Object.keys(Toolbar_default).length > 0 ? Toolbar_default : {
  toolbar: "toolbar",
  navButtons: "navButtons",
  iconBtn: "iconBtn",
  separator: "separator",
  actions: "actions",
  actionBtn: "actionBtn",
  actionBtnPrimary: "actionBtnPrimary",
  actionBtnDanger: "actionBtnDanger",
  searchWrapper: "searchWrapper",
  searchIcon: "searchIcon",
  searchInput: "searchInput",
  viewToggle: "viewToggle",
  viewToggleBtn: "viewToggleBtn",
  viewToggleBtnActive: "viewToggleBtnActive",
  toolbarCloseBtn: "toolbarCloseBtn",
  categoryFilter: "categoryFilter",
  categoryBtn: "categoryBtn",
  categoryBtnActive: "categoryBtnActive"
};
function Toolbar() {
  const {
    state,
    config,
    goBack,
    goForward,
    goUp,
    refreshFiles,
    openModal,
    deleteItems,
    downloadFile,
    setViewMode,
    setSearch,
    setCategory
  } = useFileManager();
  const canGoBack = state.historyIndex > 0;
  const canGoForward = state.historyIndex < state.navigationHistory.length - 1;
  const rootPath = config.rootPath || "/";
  const canGoUp = state.currentPath !== rootPath && state.currentPath !== "/";
  const hasSelection = state.selectedItems.length > 0;
  const singleFileSelected = state.selectedItems.length === 1 && !state.selectedItems[0].isDirectory;
  const isSelectionMode = config.selectionMode === true;
  const showCategoryFilter = config.showCategoryFilter !== false;
  const hasInitialCategory = config.initialCategory && config.initialCategory !== "all";
  const categories = [
    { id: "all", label: "All", icon: "\u{1F4C1}" },
    { id: "documents", label: "Documents", icon: "\u{1F4C4}" },
    { id: "images", label: "Images", icon: "\u{1F5BC}\uFE0F" },
    { id: "media", label: "Media", icon: "\u{1F3B5}" },
    { id: "other", label: "Other", icon: "\u{1F4E6}" }
  ];
  const handleSelect = () => {
    if (config.onFileSelect && hasSelection) {
      config.onFileSelect(state.selectedItems);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: styles10.toolbar, children: [
    /* @__PURE__ */ jsxs("div", { className: styles10.navButtons, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles10.iconBtn,
          onClick: goBack,
          disabled: !canGoBack,
          title: "Back",
          children: /* @__PURE__ */ jsx(ArrowBackIcon, { size: 18 })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles10.iconBtn,
          onClick: goForward,
          disabled: !canGoForward,
          title: "Forward",
          children: /* @__PURE__ */ jsx(ArrowForwardIcon, { size: 18 })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles10.iconBtn,
          onClick: goUp,
          disabled: !canGoUp,
          title: "Go up",
          children: /* @__PURE__ */ jsx(ArrowUpIcon, { size: 18 })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles10.iconBtn,
          onClick: refreshFiles,
          title: "Refresh",
          children: /* @__PURE__ */ jsx(RefreshIcon, { size: 18 })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles10.separator }),
    /* @__PURE__ */ jsxs("div", { className: styles10.actions, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: styles10.actionBtnPrimary,
          onClick: () => openModal("upload"),
          title: "Upload files",
          children: [
            /* @__PURE__ */ jsx(UploadIcon, { size: 16 }),
            /* @__PURE__ */ jsx("span", { children: "Upload" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: styles10.actionBtn,
          onClick: () => openModal("newFolder"),
          title: "New folder",
          children: [
            /* @__PURE__ */ jsx(NewFolderIcon, { size: 16 }),
            /* @__PURE__ */ jsx("span", { children: "New Folder" })
          ]
        }
      ),
      isSelectionMode && hasSelection && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: styles10.separator }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles10.actionBtnPrimary,
            onClick: handleSelect,
            title: `Select ${state.selectedItems.length} file(s)`,
            children: [
              "\u2713 Select (",
              state.selectedItems.length,
              ")"
            ]
          }
        )
      ] }),
      !isSelectionMode && hasSelection && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: styles10.separator }),
        singleFileSelected && /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles10.actionBtn,
            onClick: () => downloadFile(state.selectedItems[0]),
            title: "Download",
            children: [
              /* @__PURE__ */ jsx(DownloadIcon, { size: 16 }),
              /* @__PURE__ */ jsx("span", { children: "Download" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `${styles10.actionBtn} ${styles10.actionBtnDanger}`,
            onClick: () => openModal("delete"),
            title: "Delete selected",
            children: [
              /* @__PURE__ */ jsx(DeleteIcon, { size: 16 }),
              /* @__PURE__ */ jsx("span", { children: "Delete" })
            ]
          }
        )
      ] })
    ] }),
    showCategoryFilter && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: styles10.separator }),
      /* @__PURE__ */ jsx("div", { className: styles10.categoryFilter, children: categories.map((cat) => /* @__PURE__ */ jsxs(
        "button",
        {
          className: state.activeCategory === cat.id ? styles10.categoryBtnActive : styles10.categoryBtn,
          onClick: () => setCategory(cat.id),
          disabled: hasInitialCategory,
          title: hasInitialCategory ? "Category filter is locked" : cat.label,
          children: [
            /* @__PURE__ */ jsx("span", { children: cat.icon }),
            /* @__PURE__ */ jsx("span", { children: cat.label })
          ]
        },
        cat.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles10.searchWrapper, children: [
      /* @__PURE__ */ jsx(SearchIcon, { size: 15, className: styles10.searchIcon }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: styles10.searchInput,
          placeholder: "Search files...",
          value: state.searchQuery,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles10.viewToggle, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: state.viewMode === "grid" ? styles10.viewToggleBtnActive : styles10.viewToggleBtn,
          onClick: () => setViewMode("grid"),
          title: "Grid view",
          children: /* @__PURE__ */ jsx(GridViewIcon, { size: 16 })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: state.viewMode === "list" ? styles10.viewToggleBtnActive : styles10.viewToggleBtn,
          onClick: () => setViewMode("list"),
          title: "List view",
          children: /* @__PURE__ */ jsx(ListViewIcon, { size: 16 })
        }
      )
    ] }),
    config.onClose && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: styles10.toolbarCloseBtn,
        onClick: config.onClose,
        title: "Close",
        "aria-label": "Close",
        children: /* @__PURE__ */ jsx(CloseIcon, { size: 16 })
      }
    )
  ] });
}
var styles11 = Object.keys(Modals_default).length > 0 ? Modals_default : modalClassNames;
function UploadModal() {
  const { state, config, uploadFiles, closeModal, clearUploadProgress } = useFileManager();
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const isUploading = state.uploadProgress.some((p) => p.status === "uploading");
  const hasUploadError = state.uploadProgress.some((p) => p.status === "error");
  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  }, []);
  const handleClose = () => {
    setFiles([]);
    setRejectedFiles([]);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    closeModal();
  };
  const category = config.initialCategory || "all";
  const acceptAttribute = getAcceptForCategory(category);
  const hasRestriction = category !== "all";
  const filterFilesByCategory = (fileList) => {
    if (!hasRestriction) return fileList;
    const accepted = [];
    const rejected = [];
    fileList.forEach((file) => {
      if (fileMatchesCategory(file.name, category)) {
        accepted.push(file);
      } else {
        rejected.push(file.name);
      }
    });
    if (rejected.length > 0) {
      setRejectedFiles((prev) => [...prev, ...rejected]);
      setTimeout(() => setRejectedFiles([]), 5e3);
    }
    return accepted;
  };
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    clearUploadProgress();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const filteredFiles = filterFilesByCategory(droppedFiles);
    setFiles((prev) => [...prev, ...filteredFiles]);
  }, [hasRestriction, category, clearUploadProgress]);
  const handleFileSelect = (e) => {
    clearUploadProgress();
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const filteredFiles = filterFilesByCategory(selectedFiles);
      setFiles((prev) => [...prev, ...filteredFiles]);
    }
  };
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpload = async () => {
    if (files.length === 0 || hasUploadError) return;
    await uploadFiles(files);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return /* @__PURE__ */ jsx("div", { className: styles11.overlay, onClick: handleClose, children: /* @__PURE__ */ jsxs("div", { className: styles11.modalLarge, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles11.modalHeader, children: [
      /* @__PURE__ */ jsx("span", { className: styles11.modalTitle, children: "Upload Files" }),
      /* @__PURE__ */ jsx("button", { className: styles11.closeBtn, onClick: handleClose, children: /* @__PURE__ */ jsx(CloseIcon, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles11.modalBody, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: isDragOver ? styles11.dropZoneActive : styles11.dropZone,
          onDragOver: (e) => {
            e.preventDefault();
            setIsDragOver(true);
          },
          onDragLeave: () => setIsDragOver(false),
          onDrop: handleDrop,
          onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: styles11.dropZoneIcon, children: /* @__PURE__ */ jsx(UploadIcon, { size: 40 }) }),
            /* @__PURE__ */ jsx("div", { className: styles11.dropZoneText, children: "Drag & drop files here" }),
            /* @__PURE__ */ jsxs("div", { className: styles11.dropZoneSubtext, children: [
              "or ",
              /* @__PURE__ */ jsx("span", { className: styles11.dropZoneBrowse, children: "browse" }),
              " to select files",
              hasRestriction && /* @__PURE__ */ jsxs("div", { style: { marginTop: "8px", fontSize: "0.85em", color: "#fbbf24" }, children: [
                "Only ",
                category,
                " files allowed"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                multiple: true,
                accept: acceptAttribute,
                style: { display: "none" },
                onChange: handleFileSelect
              }
            )
          ]
        }
      ),
      rejectedFiles.length > 0 && /* @__PURE__ */ jsxs("div", { style: {
        padding: "12px",
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "8px",
        marginTop: "12px",
        fontSize: "0.875rem",
        color: "#fca5a5"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: "600", marginBottom: "6px" }, children: "\u274C Rejected files (invalid type):" }),
        /* @__PURE__ */ jsx("ul", { style: { margin: 0, paddingLeft: "20px" }, children: rejectedFiles.map((fileName, idx) => /* @__PURE__ */ jsx("li", { children: fileName }, idx)) })
      ] }),
      (files.length > 0 || state.uploadProgress.length > 0) && /* @__PURE__ */ jsx("div", { className: styles11.fileQueue, children: state.uploadProgress.length > 0 ? state.uploadProgress.map((p, idx) => /* @__PURE__ */ jsxs("div", { className: styles11.fileQueueItem, children: [
        getFileIcon({ isDirectory: false, mimeType: p.file.type, name: p.file.name }, 20),
        /* @__PURE__ */ jsxs("div", { className: styles11.fileQueueInfo, children: [
          /* @__PURE__ */ jsx("div", { className: styles11.fileQueueName, children: p.file.name }),
          /* @__PURE__ */ jsx("div", { className: styles11.fileQueueSize, children: formatFileSize(p.file.size) }),
          p.status === "error" && p.error && /* @__PURE__ */ jsx("div", { className: styles11.fileQueueError, children: p.error }),
          /* @__PURE__ */ jsx("div", { className: styles11.progressBar, children: /* @__PURE__ */ jsx(
            "div",
            {
              className: p.status === "success" ? styles11.progressFillSuccess : p.status === "error" ? styles11.progressFillError : styles11.progressFill,
              style: { width: `${p.progress}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles11.statusIcon, children: p.status === "success" ? "\u2713" : p.status === "error" ? "\u2715" : "" }),
        p.status === "error" && /* @__PURE__ */ jsx(
          "button",
          {
            className: styles11.fileQueueRemove,
            onClick: clearUploadProgress,
            title: "Dismiss error",
            children: /* @__PURE__ */ jsx(CloseIcon, { size: 14 })
          }
        )
      ] }, idx)) : files.map((file, idx) => /* @__PURE__ */ jsxs("div", { className: styles11.fileQueueItem, children: [
        getFileIcon({ isDirectory: false, mimeType: file.type, name: file.name }, 20),
        /* @__PURE__ */ jsxs("div", { className: styles11.fileQueueInfo, children: [
          /* @__PURE__ */ jsx("div", { className: styles11.fileQueueName, children: file.name }),
          /* @__PURE__ */ jsx("div", { className: styles11.fileQueueSize, children: formatFileSize(file.size) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles11.fileQueueRemove,
            onClick: () => removeFile(idx),
            children: /* @__PURE__ */ jsx(CloseIcon, { size: 14 })
          }
        )
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles11.modalFooter, children: [
      /* @__PURE__ */ jsx("button", { className: styles11.btn, onClick: handleClose, children: "Cancel" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: styles11.btnPrimary,
          onClick: handleUpload,
          disabled: files.length === 0 || isUploading || hasUploadError,
          children: [
            /* @__PURE__ */ jsx(UploadIcon, { size: 16 }),
            isUploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length})` : ""}`
          ]
        }
      )
    ] })
  ] }) });
}

// src/components/FileManager/FileManager.module.css
var FileManager_default = {};
var styles12 = Object.keys(FileManager_default).length > 0 ? FileManager_default : {
  fileManager: "fileManager",
  body: "body",
  content: "content",
  contentArea: "contentArea",
  loadingOverlay: "loadingOverlay",
  spinner: "spinner"
};
function FileManagerInner() {
  var _a;
  const {
    state,
    config,
    navigateTo,
    cutItems,
    copyItems,
    pasteItems,
    deleteItems,
    openModal,
    selectAll,
    refreshFiles
  } = useFileManager();
  const [contextMenu, setContextMenu] = useState(null);
  useEffect(() => {
    navigateTo(state.currentPath);
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "a":
            e.preventDefault();
            selectAll();
            break;
          case "c":
            e.preventDefault();
            copyItems();
            break;
          case "x":
            e.preventDefault();
            cutItems();
            break;
          case "v":
            e.preventDefault();
            pasteItems();
            break;
        }
      }
      if (e.key === "Delete" && state.selectedItems.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openModal("delete");
        return;
      }
      if (e.key === "F2" && state.selectedItems.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        openModal("rename");
        return;
      }
      if (e.key === "F5") {
        e.preventDefault();
        e.stopPropagation();
        refreshFiles();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [state.selectedItems, selectAll, copyItems, cutItems, pasteItems, openModal, refreshFiles, deleteItems]);
  const hideSystemFiles = (_a = config.hideSystemFiles) != null ? _a : true;
  const sortedFiles = sortFiles(state.files, state.sortConfig);
  const searchFiltered = filterFiles(sortedFiles, state.searchQuery, hideSystemFiles);
  const processedFiles = filterByCategory(searchFiltered, state.activeCategory);
  const handleContextMenu = useCallback(
    (e, item) => {
      e.preventDefault();
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        item
      });
    },
    []
  );
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: styles12.fileManager,
      "data-fm-root": "true",
      "data-fm-theme": config.theme || "dark",
      style: {
        height: config.height || "700px",
        width: config.width || "100%"
      },
      children: [
        /* @__PURE__ */ jsx(Toolbar, {}),
        /* @__PURE__ */ jsx(ErrorBanner, {}),
        config.showBreadcrumb !== false && /* @__PURE__ */ jsx(Breadcrumb, {}),
        /* @__PURE__ */ jsxs("div", { className: styles12.body, children: [
          config.showSidebar !== false && /* @__PURE__ */ jsx(Sidebar, {}),
          /* @__PURE__ */ jsx("div", { className: styles12.content, children: /* @__PURE__ */ jsx(
            "div",
            {
              className: styles12.contentArea,
              onContextMenu: (e) => {
                if (e.target !== e.currentTarget) return;
                e.preventDefault();
                handleContextMenu(e);
              },
              children: state.viewMode === "grid" ? /* @__PURE__ */ jsx(FileGrid, { files: processedFiles, onContextMenu: handleContextMenu }) : /* @__PURE__ */ jsx(FileList, { files: processedFiles, onContextMenu: handleContextMenu })
            }
          ) })
        ] }),
        config.showStatusBar !== false && /* @__PURE__ */ jsx(StatusBar, {}),
        contextMenu && /* @__PURE__ */ jsx(
          ContextMenu,
          {
            position: contextMenu.position,
            item: contextMenu.item,
            onClose: closeContextMenu
          }
        ),
        state.activeModal === "upload" && /* @__PURE__ */ jsx(UploadModal, {}),
        state.activeModal === "preview" && /* @__PURE__ */ jsx(PreviewModal, {}),
        (state.activeModal === "newFolder" || state.activeModal === "rename") && /* @__PURE__ */ jsx(InputModal, {}),
        state.activeModal === "delete" && /* @__PURE__ */ jsx(DeleteModal, {}),
        state.isLoading && /* @__PURE__ */ jsx("div", { className: styles12.loadingOverlay, children: /* @__PURE__ */ jsx("div", { className: styles12.spinner }) })
      ]
    }
  );
}
function FileManager({ adapter, config = {} }) {
  return /* @__PURE__ */ jsx(FileManagerProvider, { adapter, config, children: /* @__PURE__ */ jsx(FileManagerInner, {}) });
}

// src/adapters/RestAdapter.ts
var RestAdapter = class {
  constructor(baseUrl = "/api/files") {
    this.baseUrl = baseUrl;
  }
  async listFiles(path) {
    const res = await fetch(
      `${this.baseUrl}?path=${encodeURIComponent(path)}`
    );
    if (!res.ok) throw new Error("Failed to list files");
    return res.json();
  }
  async createFolder(path, name) {
    const res = await fetch(`${this.baseUrl}/folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, name })
    });
    if (!res.ok) throw new Error("Failed to create folder");
    return res.json();
  }
  async deleteItems(targets) {
    const res = await fetch(this.baseUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: targets.map((t) => t.path) })
    });
    if (!res.ok) throw new Error("Failed to delete items");
  }
  async renameItem(path, newName) {
    const res = await fetch(`${this.baseUrl}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, newName })
    });
    if (!res.ok) throw new Error("Failed to rename item");
    return res.json();
  }
  async moveItems(sourcePaths, targetPath) {
    const res = await fetch(`${this.baseUrl}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourcePaths, targetPath })
    });
    if (!res.ok) throw new Error("Failed to move items");
  }
  async copyItems(sourcePaths, targetPath) {
    const res = await fetch(`${this.baseUrl}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourcePaths, targetPath })
    });
    if (!res.ok) throw new Error("Failed to copy items");
  }
  async uploadFiles(path, files, onProgress) {
    const formData = new FormData();
    formData.append("path", path);
    files.forEach((file) => formData.append("files", file));
    if (onProgress) {
      onProgress(
        files.map((file) => ({
          file,
          progress: 0,
          status: "uploading"
        }))
      );
    }
    const res = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Failed to upload files");
    if (onProgress) {
      onProgress(
        files.map((file) => ({
          file,
          progress: 100,
          status: "success"
        }))
      );
    }
    return res.json();
  }
  async downloadFile(path) {
    const response = await fetch(`${this.baseUrl}/download?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return response.blob();
  }
  async saveFileContent(path, content) {
    const formData = new FormData();
    formData.append("path", path);
    if (content instanceof Blob) {
      formData.append("content", content);
    } else {
      formData.append("content", new Blob([content], { type: "text/plain" }));
    }
    const response = await fetch(`${this.baseUrl}/save`, {
      method: "PUT",
      body: formData
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Save failed: ${response.statusText}`);
    }
    return response.json();
  }
  getPreviewUrl(path) {
    return `${this.baseUrl}/preview?path=${encodeURIComponent(path)}`;
  }
  getDownloadUrl(path) {
    return `${this.baseUrl}/download?path=${encodeURIComponent(path)}`;
  }
  async search(path, query) {
    const res = await fetch(
      `${this.baseUrl}/search?path=${encodeURIComponent(path)}&q=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error("Failed to search files");
    return res.json();
  }
};
var FOLDER_PLACEHOLDER_CONTENT = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
var FOLDER_PLACEHOLDER_MIME = "image/svg+xml";
var FOLDER_PLACEHOLDER_FILE = ".folderkeep";
var FOLDER_MARKER_FILES = [
  FOLDER_PLACEHOLDER_FILE,
  ".emptyFolderPlaceholder",
  ".gitkeep"
];
function isStorageFolder(item) {
  return item.id == null;
}
var SupabaseAdapter = class {
  constructor(config) {
    var _a;
    this.supabase = (_a = config.supabase) != null ? _a : createClient(config.url, config.anonKey);
    this.bucketName = config.bucketName;
  }
  async listFiles(path) {
    const storagePath = toStoragePath(path);
    const parentPath = normalizeManagerPath(path);
    const { data, error } = await this.supabase.storage.from(this.bucketName).list(storagePath, {
      limit: 1e3,
      sortBy: { column: "name", order: "asc" }
    });
    if (error) {
      console.error("Error listing files:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
    return (data || []).map((item) => {
      var _a, _b;
      const fullPath = storagePath ? normalizeManagerPath(`${storagePath}/${item.name}`) : normalizeManagerPath(`/${item.name}`);
      return {
        id: item.id || fullPath,
        name: item.name,
        isDirectory: isStorageFolder(item),
        size: ((_a = item.metadata) == null ? void 0 : _a.size) || 0,
        mimeType: ((_b = item.metadata) == null ? void 0 : _b.mimetype) || "application/octet-stream",
        path: fullPath,
        parentPath,
        createdAt: item.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        modifiedAt: item.updated_at || item.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        thumbnailUrl: isStorageFolder(item) ? void 0 : this.getPreviewUrl(fullPath)
      };
    });
  }
  async createFolder(path, name) {
    const storagePath = toStoragePath(path);
    const folderPath = storagePath ? `${storagePath}/${name}/${FOLDER_PLACEHOLDER_FILE}` : `${name}/${FOLDER_PLACEHOLDER_FILE}`;
    const { error } = await this.supabase.storage.from(this.bucketName).upload(
      folderPath,
      new Blob([FOLDER_PLACEHOLDER_CONTENT], { type: FOLDER_PLACEHOLDER_MIME }),
      {
        contentType: FOLDER_PLACEHOLDER_MIME,
        upsert: false
      }
    );
    if (error) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }
    const fullPath = storagePath ? normalizeManagerPath(`${storagePath}/${name}`) : normalizeManagerPath(`/${name}`);
    const parentPath = normalizeManagerPath(path);
    return {
      id: fullPath,
      name,
      isDirectory: true,
      size: 0,
      mimeType: "application/folder",
      path: fullPath,
      parentPath,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      modifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async deleteItems(targets) {
    for (const target of targets) {
      const storagePath = toStoragePath(target.path);
      if (target.isDirectory) {
        await this.deleteFolder(storagePath);
      } else if (storagePath) {
        await this.removeStorageObjects([storagePath]);
      }
    }
  }
  async deleteFolder(storagePath) {
    const pathsToDelete = /* @__PURE__ */ new Set();
    for (const marker of FOLDER_MARKER_FILES) {
      pathsToDelete.add(`${storagePath}/${marker}`);
    }
    await this.collectFilePathsUnderPrefix(storagePath, pathsToDelete);
    await this.removeStorageObjects([...pathsToDelete]);
  }
  async collectFilePathsUnderPrefix(prefix, paths) {
    let offset = 0;
    const limit = 100;
    while (true) {
      const { data: items, error } = await this.supabase.storage.from(this.bucketName).list(prefix, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" }
      });
      if (error || !items || items.length === 0) {
        break;
      }
      for (const item of items) {
        const childPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (isStorageFolder(item)) {
          for (const marker of FOLDER_MARKER_FILES) {
            paths.add(`${childPath}/${marker}`);
          }
          await this.collectFilePathsUnderPrefix(childPath, paths);
        } else {
          paths.add(childPath);
        }
      }
      if (items.length < limit) {
        break;
      }
      offset += limit;
    }
  }
  normalizeObjectKey(objectPath) {
    return objectPath.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\//, "");
  }
  async removeStorageObjects(paths) {
    const normalized = [
      ...new Set(paths.map((p) => this.normalizeObjectKey(p)).filter(Boolean))
    ];
    if (normalized.length === 0) {
      return;
    }
    const batchSize = 100;
    for (let i = 0; i < normalized.length; i += batchSize) {
      const batch = normalized.slice(i, i + batchSize);
      const { error } = await this.supabase.storage.from(this.bucketName).remove(batch);
      if (error) {
        throw new Error(`Failed to delete items: ${error.message}`);
      }
    }
  }
  async renameItem(path, newName) {
    var _a, _b;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    const pathParts = normalizedPath.split("/");
    pathParts.pop();
    const parentPath = pathParts.join("/");
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;
    const { error: moveError } = await this.supabase.storage.from(this.bucketName).move(normalizedPath, newPath);
    if (moveError) {
      throw new Error(`Failed to rename item: ${moveError.message}`);
    }
    const { data, error } = await this.supabase.storage.from(this.bucketName).list(parentPath, {
      search: newName
    });
    if (error || !data || data.length === 0) {
      return {
        id: `/${newPath}`,
        name: newName,
        isDirectory: false,
        size: 0,
        mimeType: "application/octet-stream",
        path: `/${newPath}`,
        parentPath: `/${parentPath}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        modifiedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const item = data[0];
    return {
      id: item.id || `/${newPath}`,
      name: item.name,
      isDirectory: isStorageFolder(item),
      size: ((_a = item.metadata) == null ? void 0 : _a.size) || 0,
      mimeType: ((_b = item.metadata) == null ? void 0 : _b.mimetype) || "application/octet-stream",
      path: normalizeManagerPath(`/${newPath}`),
      parentPath: normalizeManagerPath(`/${parentPath}`),
      createdAt: item.created_at || (/* @__PURE__ */ new Date()).toISOString(),
      modifiedAt: item.updated_at || item.created_at || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async moveItems(sourcePaths, targetPath) {
    const normalizedTarget = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
    for (const sourcePath of sourcePaths) {
      const normalizedSource = sourcePath.startsWith("/") ? sourcePath.slice(1) : sourcePath;
      const fileName = normalizedSource.split("/").pop();
      const destination = normalizedTarget ? `${normalizedTarget}/${fileName}` : fileName;
      const { error } = await this.supabase.storage.from(this.bucketName).move(normalizedSource, destination);
      if (error) {
        throw new Error(`Failed to move ${fileName}: ${error.message}`);
      }
    }
  }
  async copyItems(sourcePaths, targetPath) {
    const normalizedTarget = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
    for (const sourcePath of sourcePaths) {
      const normalizedSource = sourcePath.startsWith("/") ? sourcePath.slice(1) : sourcePath;
      const fileName = normalizedSource.split("/").pop();
      const destination = normalizedTarget ? `${normalizedTarget}/${fileName}` : fileName;
      const { error } = await this.supabase.storage.from(this.bucketName).copy(normalizedSource, destination);
      if (error) {
        throw new Error(`Failed to copy ${fileName}: ${error.message}`);
      }
    }
  }
  async uploadFiles(path, files, onProgress) {
    const storagePath = toStoragePath(path);
    const uploadedItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const safeName = sanitizeStorageFileName(file.name);
      const filePath = storagePath ? `${storagePath}/${safeName}` : safeName;
      if (onProgress) {
        onProgress(
          files.map((f, idx) => ({
            file: f,
            progress: idx < i ? 100 : idx === i ? 50 : 0,
            status: idx < i ? "success" : idx === i ? "uploading" : "pending"
          }))
        );
      }
      const { error } = await this.supabase.storage.from(this.bucketName).upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });
      if (error) {
        if (onProgress) {
          onProgress(
            files.map((f, idx) => ({
              file: f,
              progress: idx <= i ? 100 : 0,
              status: idx < i ? "success" : idx === i ? "error" : "pending",
              error: idx === i ? error.message : void 0
            }))
          );
        }
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
      uploadedItems.push({
        id: normalizeManagerPath(`/${filePath}`),
        name: safeName,
        isDirectory: false,
        size: file.size,
        mimeType: file.type,
        path: normalizeManagerPath(`/${filePath}`),
        parentPath: normalizeManagerPath(path),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        modifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        thumbnailUrl: this.getPreviewUrl(`/${filePath}`)
      });
    }
    if (onProgress) {
      onProgress(
        files.map((f) => ({
          file: f,
          progress: 100,
          status: "success"
        }))
      );
    }
    return uploadedItems;
  }
  async downloadFile(path) {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    const { data, error } = await this.supabase.storage.from(this.bucketName).download(normalizedPath);
    if (error || !data) {
      throw new Error(`Failed to download file: ${(error == null ? void 0 : error.message) || "Unknown error"}`);
    }
    return data;
  }
  async saveFileContent(path, content) {
    const storagePath = toStoragePath(path);
    let blob;
    if (typeof content === "string") {
      blob = new Blob([content], { type: "text/plain" });
    } else {
      blob = content;
    }
    await this.supabase.storage.from(this.bucketName).remove([storagePath]);
    const { error } = await this.supabase.storage.from(this.bucketName).upload(storagePath, blob, {
      contentType: blob.type || "application/octet-stream",
      upsert: false
    });
    if (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
    const fileName = storagePath.split("/").pop() || "file";
    const parentPath = storagePath.substring(0, storagePath.lastIndexOf("/"));
    return {
      id: normalizeManagerPath(`/${storagePath}`),
      name: fileName,
      isDirectory: false,
      size: blob.size,
      mimeType: blob.type || "application/octet-stream",
      path: normalizeManagerPath(`/${storagePath}`),
      parentPath: parentPath ? normalizeManagerPath(`/${parentPath}`) : "/",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      modifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  getPreviewUrl(path) {
    const storagePath = toStoragePath(path);
    const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(storagePath);
    return data.publicUrl;
  }
  getDownloadUrl(path) {
    return this.getPreviewUrl(path);
  }
  async search(path, query) {
    const storagePath = toStoragePath(path);
    const { data, error } = await this.supabase.storage.from(this.bucketName).list(storagePath, {
      limit: 1e3,
      search: query
    });
    if (error) {
      throw new Error(`Failed to search: ${error.message}`);
    }
    const parentPath = normalizeManagerPath(path);
    return (data || []).map((item) => {
      var _a, _b;
      const fullPath = storagePath ? normalizeManagerPath(`${storagePath}/${item.name}`) : normalizeManagerPath(`/${item.name}`);
      return {
        id: item.id || fullPath,
        name: item.name,
        isDirectory: isStorageFolder(item),
        size: ((_a = item.metadata) == null ? void 0 : _a.size) || 0,
        mimeType: ((_b = item.metadata) == null ? void 0 : _b.mimetype) || "application/octet-stream",
        path: fullPath,
        parentPath,
        createdAt: item.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        modifiedAt: item.updated_at || item.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        thumbnailUrl: isStorageFolder(item) ? void 0 : this.getPreviewUrl(fullPath)
      };
    });
  }
};

export { FileManager, FileManagerProvider, RestAdapter, SupabaseAdapter, filterFiles, formatDate, formatFileSize, getFileExtension, getFileIcon, isPreviewable, sortFiles, useFileManager };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map