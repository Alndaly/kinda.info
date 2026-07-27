ComfyUI 的自定义节点，本质上是一个可以被框架发现的 Python 类。最小插件只需要两个文件：

```text
ComfyUI-July-Nodes/
├── __init__.py
└── nodes.py
```

把这个目录放进 `ComfyUI/custom_nodes/`，重启 ComfyUI 后即可加载。

## 写一个最小节点

下面的节点接收一段文本，并为它添加前缀：

```python
class AddPrefix:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"multiline": True}),
                "prefix": ("STRING", {"default": "July: "}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("result",)
    FUNCTION = "run"
    CATEGORY = "July/Text"

    def run(self, text, prefix):
        return (f"{prefix}{text}",)
```

几个约定分别负责不同的事情：

- `INPUT_TYPES` 声明输入端口和界面控件。
- `RETURN_TYPES` 与 `RETURN_NAMES` 声明输出。
- `FUNCTION` 指向节点执行时调用的方法。
- `CATEGORY` 决定节点在菜单中的位置。
- 执行方法必须返回元组，即使只有一个结果也要写成 `(result,)`。

## 导出节点

在 `nodes.py` 末尾建立类映射：

```python
NODE_CLASS_MAPPINGS = {
    "JulyAddPrefix": AddPrefix,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "JulyAddPrefix": "Add Prefix",
}
```

再从 `__init__.py` 导出：

```python
from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]
```

重启后，在节点搜索中输入 `Add Prefix` 即可找到它。

## 调试顺序

节点没有出现时，按下面的顺序检查通常最快：

1. 查看 ComfyUI 启动终端里是否有 import error。
2. 确认插件目录直接位于 `custom_nodes/`，没有多嵌套一层。
3. 检查 `NODE_CLASS_MAPPINGS` 的键是否唯一。
4. 确认输入、输出数量与执行方法的参数和返回值一致。
5. 修改 Python 文件后完整重启 ComfyUI，而不是只刷新浏览器。

先让最小节点稳定加载，再逐步加入模型、图像张量和前端扩展，排错成本会低很多。
