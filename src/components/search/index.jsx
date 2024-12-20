import { forwardRef,useState , useEffect , useRef } from "react";
import { View,Input } from "@tarojs/components";
import { Icon } from '@antmjs/vantui';
import { debounce } from 'lodash'
import "./index.less";

const Com  = forwardRef((props, ref) => {
  const {
    placeholder = "请输入搜索关键词",
    defaultValue = "",
    leftIcon = true,
    confirmType="search"
  } = props;


  const [isInitialRender, setIsInitialRender] = useState(true);
  const [value, setValue] = useState(defaultValue);

  const debouncedSearch = useRef(debounce((val) => {
    console.log(`❓ Searching for ${val}`);
    props?.onSearch?.(val);
  }, 500)).current;

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false); // 设置首次渲染状态为非首次
    } else {
      debouncedSearch(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);


  return (
    <View className="search">
      {leftIcon && <View className="search--l"><View className="search-icon" /></View>}

      <Input className="search--c"
        ref={ref}
        confirmType={confirmType}
        placeholder={placeholder}
        value={value}
        onInput={(e)=>{
          const _value = (e.target.value??"").trim();
          setValue(_value)
        }}
        onConfirm={(e)=>{
          props?.onSearch?.(e.target.value);
        }}
      />

      {value && <View className="search--r"
        onClick={()=>{
          setValue("");
          props?.onSearch?.("");
        }}
      >
        <Icon color="#999" name="cross" size="14px" className="clear-icon"></Icon>
      </View>}
    </View>
  );
});

export default Com;
