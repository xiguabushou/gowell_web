import { createStore } from 'vuex'
import { getLocalStorage, setLocalStorage } from "@/utils/common";

const store = createStore({
  state: {
    userInfo: getLocalStorage('userInfo') || null,
  },
  getters: {
    userInfo(state){
      return state.userInfo
    }
  },
  mutations: {
    setUserInfo(state,userInfo){
      state.userInfo = userInfo
      setLocalStorage('userInfo',userInfo)
    }
  },
})
export default store
