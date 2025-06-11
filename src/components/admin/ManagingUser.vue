<template>
    <div class="user-management-container">
        <h1>사용자 관리</h1>
        <div class="content">
            <!-- 조직도 -->
            <aside class="sidebar">
                <div class="sub-title">조직도</div>
                <input  type="text" placeholder="부서 🔍" class="side-search search-box" />
                <ul class="tree">
                    <li>기아 타이거즈
                        <!-- 부서 목록 -->
                        <DeptTree :tree="tree" :expanded-ids="expandedIds" @toggle="handleToggle" />
                    </li>
                </ul>
            </aside>

            <!-- 구성원 -->
            <section class="main">
                <div class="sub-title">구성원</div>
                <div class="filters">
                    <button class="filter-btn">부서 : {{ deptFilter }}</button>
                    <button class="filter-btn">직급 : {{ jobRankFilter }}</button>
                    <button class="filter-btn">직책 : {{ jobRoleFilter }}</button>
                    <button class="filter-btn" @click="creationFilterModal">생성 권한 : {{ isCreationFilter }}</button>
                    <button class="filter-btn" @click="activeFilterSwitch">계정 활성 여부 : {{ isActiveFilter ? '활성' : '비활성' }}</button>
                </div>
                <div class="create-user">
                    <div class="filters">    
                        <button class="green filter-btn">+ 협력 업체 계정 생성</button>
                        <button class="blue filter-btn">+ 구성원 계정 생성</button>
                    </div>
                    <input type="text" placeholder="이름 🔍" class="main-search search-box"/>
                </div>


                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>부서</th>
                            <th>직급</th>
                            <th>직책</th>
                            <th>프로젝트 생성 권한</th>
                            <th>계정 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(user, index) in userList" :key="index" @click="handelUserClick(user.id)">
                            <td>{{ user.name }}</td>
                            <td>{{ user.deptName }}</td>
                            <td>{{ user.jobRankName }}</td>
                            <td>{{ user.jobRoleName }}</td>
                            <td>{{ user.isCreation ? 'O' : 'X' }}</td>
                            <td>
                                <div
                                    :style="{ 
                                        color: user.isActive ? 'red' : 'blue',
                                        backgroundColor: user.isActive ? '#ffdddd' : '#ddddff'
                                    }"
                                    class = "active-card"
                                >
                                    {{ user.isActive ? '비활성' : '활성' }}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="pagination">
                    <button disabled>← 이전</button>
                    <button class="current">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>…</span>
                    <button>68</button>
                    <button>다음 →</button>
                </div>
            </section>
        </div>
        <div v-if="selectedUserId !== null" @click="selectedUserId = null">
            <div @click.stop>
                <UserInfo 
                    :userId="selectedUserId" 
                    :deptList="filteredDeptList"
                    :jobRankList="filteredRankList"
                    :jobRoleList="filteredRoleList"
                    @close="selectedUserId = null"
                    @user-updated="updateUserInList"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    import api from '@/api'
    import { ref, onMounted, computed, watch } from 'vue'
    import DeptTree from './DeptTree.vue'
    import UserInfo from '../user/UserInfo.vue'

    const deptList = ref([])
    const tree = ref([])
    const expandedIds = ref([])

    const jobRankList = ref([])
    const jobRoleList = ref([])

    const userList = ref([])

    const deptFilter = ref('기획팀');
    const jobRankFilter = ref('과장');
    const jobRoleFilter = ref('파트장');
    const isActiveFilter = ref(true);
    const isCreationFilter = ref(null);

    const selectedUserId = ref(null)
    const searchDept = ref('')
    const searchUser = ref('')

    const isInner = ref(true)
    const isCreation = ref(false)

    function isInnerByUserId(id) {
        const user = userList.value.find(u => u.id === id)
        if (user) {
            console.log(user.isInner)
            return user.isInner
        } else {
            console.log("유저를 찾을 수 없습니다.")
        }
    }

    // 조건부 필터링(외부, 내부)
    const filteredDeptList = computed(() => {
        return isInner.value
            ? deptList.value.filter(dept => dept.name !== '협력업체')
            : deptList.value.filter(dept => dept.name === '협력업체')
    })

    const filteredRankList = computed(() => {
        return isInner.value
            ? jobRankList.value.filter(jobRank => jobRank.name !== '협력업체')
            : jobRankList.value.filter(jobRank => jobRank.name === '협력업체')
    })

    const filteredRoleList = computed(() => {
        return isInner.value
            ? jobRoleList.value.filter(jobRole => jobRole.name !== '협력업체')
            : jobRoleList.value.filter(jobRole => jobRole.name === '협력업체')
    })

    function updateUserInList(updateUser) {
        const index = userList.value.findIndex(u => u.id === updateUser.id)
        if (index !== -1) {
            userList.value[index] = {
                ...userList.value[index], // 기존 정보 유지
                ...updateUser
            }
        }
    }

    function creation(id) {
        const user = userList.value.find(u => u.id === id)
        if (user) {
            console.log('creation', user.isCreation)
            return user.isCreation
        } else {
            console.log("유저를 찾을 수 없습니다.")
        }
    }

    function handelUserClick(userId) {
        selectedUserId.value = userId
        console.log(selectedUserId.value)
        isCreation.value = creation(selectedUserId.value)
        console.log('creation설정', isCreation.value)
        isInner.value = isInnerByUserId(selectedUserId.value)
        console.log('isInner', isInner.value)
    }
    
    function activeFilterSwitch() {
        isActiveFilter.value = !isActiveFilter.value
    }

    onMounted(async () => {
        const res = await api.get('/api/org/all/info')
        const orgData = res.data.data

        deptList.value = orgData.deptList
        jobRankList.value = orgData.jobRankList
        jobRoleList.value = orgData.jobRoleList

        tree.value = buildDeptTree(deptList.value)

        // 유저 리스트 요청도 날릴 예정
        const userResponse = await api.get('/api/users/find-all')
        userList.value = userResponse.data.data
    })

    function buildDeptTree(flatList, parentId = null) {
        return flatList
        .filter(dept => dept.parentDeptId === parentId)
        .map(dept => ({
            ...dept,
            children: buildDeptTree(flatList, dept.id)
        }))
    }

    function handleToggle(id) {
        if (expandedIds.value.includes(id)) {
            expandedIds.value = expandedIds.value.filter(e => e !== id)
        } else {
            expandedIds.value.push(id)
        }
    }
</script>

<style scoped>
    .user-management-container {
        padding: 40px;
        font-family: sans-serif;
        width: 80%;
    }

    h1 {
        font-size: 24px;
        margin-bottom: 20px;
    }

    .content {
        display: flex;
        gap: 24px;
    }

    /* 사이드바 */
    .sidebar {
        width: 200px;
        display: flex;
        flex-direction: column;
        /* align-items: center; */
        padding-left: 20px;
        height: 600px;
        border-radius: 10px;
        height: auto;
    }

    .tree {
        list-style: none;
    }

    .tree li {
        margin: 5px 0;
    }

    /* 메인 */
    .main {
        flex: 1;
    }

    .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
    }

    .filters button {
        padding: 3px 12px;
        border: 1px solid #ccc;
        background: white;
        cursor: pointer;
    }

    .filters .green {
        background-color: #d1fae5;
        border-color: #10b981;
        color: #065f46;
    }

    .filters .blue {
        background-color: #dbeafe;
        border-color: #3b82f6;
        color: #1e40af;
    }

    .side-search {
        width: 90%;
        padding: 3px;
        padding-left: 12px;
        margin: 12px 0;
    }

    .main-search {
        width: 300px;
        padding: 3px;
        padding-left: 12px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    th, td {
        padding: 10px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }

    .active {
        color: #2563eb;
        font-weight: bold;
    }

    .inactive {
        color: red;
    }

    /* 페이지네이션 */
    .pagination {
        display: flex;
        gap: 6px;
        margin-top: 16px;
        align-items: center;
    }

    .pagination button {
        padding: 4px 8px;
        background: white;
        border: 1px solid #ccc;
        cursor: pointer;
    }

    .pagination .current {
        font-weight: bold;
        background-color: #eee;
    }
    .filter-btn {
        border-radius: 8px;
    }
    .sub-title {
        font-size: 24px;
        font-weight: bold;
        padding: 10px;
    }
    .active-card {
        border-radius: 6px;
        padding: 2px;
    }
    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .search-box {
        background-color: white;
        border-radius: 20px;
        border: 1px solid black;
    }
    .create-user {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>