在国内网络环境中，服务器可能无法稳定访问 Hugging Face Hub。使用兼容镜像时，可以通过 `HF_ENDPOINT` 让 `huggingface_hub`、Transformers 等工具统一改用镜像地址。

临时设置：

```bash
export HF_ENDPOINT=https://hf-mirror.com
```

验证变量：

```bash
echo "$HF_ENDPOINT"
```

如果希望长期生效，把导出语句写入当前 Shell 的配置文件，例如 `~/.zshrc`：

```bash
echo 'export HF_ENDPOINT=https://hf-mirror.com' >> ~/.zshrc
source ~/.zshrc
```

镜像入口：[HF-Mirror](https://hf-mirror.com/)

> [!NOTE]
> 镜像解决的是网络可达性。访问受限模型时，仍然需要接受模型协议并配置有效的 Hugging Face Token。
