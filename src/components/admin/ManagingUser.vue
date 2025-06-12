<template>
    <div class="user-management-container">
        <h1>{{ props.title }}</h1>
        <div class="content">
            <!-- 조직도 -->
            <aside class="sidebar" style="height: 500px">
                <div class="sub-title">조직도</div>
                <input type="text" placeholder="부서 🔍" class="side-search search-box" v-model="searchDept"/>
                <ul class="tree">
                    <li>
                        <button @click="deptFilter = []">schemaName</button>
                        <!-- 부서 목록 -->
                        <DeptTree :tree="filteredDeptTree" :expanded-ids="expandedIds" @toggle="handleToggle" @click-dept="onDeptClick"/>
                    </li>
                </ul>
            </aside>

            <!-- 구성원 -->
            <section class="main">
                <div class="sub-title">구성원</div>
                <div class="filters">
                    <div class="dropdown">
                        <button class="filter-btn" @click="toggleDropdown('dept')">
                            부서 : {{ selectedDeptName || '전체' }}
                        </button>
                        <ul v-if="showDropdown.dept" class="dropdown-list">
                            <li @click="selectFilter('dept', '')">전체</li>
                            <li v-for="dept in deptList" :key="dept.id" @click="selectFilter('dept', dept.id)">
                                {{ dept.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="dropdown">
                        <button class="filter-btn" @click="toggleDropdown('rank')">
                            직급 : {{ jobRankFilter || '전체' }}
                        </button>
                        <ul v-if="showDropdown.rank" class="dropdown-list">
                            <li @click="selectFilter('rank', '')">전체</li>
                            <li v-for="rank in jobRankList" :key="rank.id" @click="selectFilter('rank', rank.name)">
                                {{ rank.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="dropdown">
                        <button class="filter-btn" @click="toggleDropdown('role')">
                            직책 : {{ jobRoleFilter || '전체' }}
                        </button>
                        <ul v-if="showDropdown.role" class="dropdown-list">
                            <li @click="selectFilter('role', '')">전체</li>
                            <li v-for="role in jobRoleList" :key="role.id" @click="selectFilter('role', role.name)">
                                {{ role.name }}
                            </li>
                        </ul>
                    </div>
                    <button class="filter-btn" @click="toggleCreationFilter">생성 권한 : {{ isCreationFilter === null ? '전체' : isCreationFilter ? 'O' : 'X' }}</button>
                    <button class="filter-btn" @click="toggleResignFilter">계정 활성 여부 : {{ isResignFilter === null ? '전체' : isResignFilter ? 'X' : 'O' }}</button>
                    <button class="filter-btn" @click="filterClear">초기화</button>
                </div>
                <div class="create-user">
                    <div class="filters">    
                        <button class="green filter-btn" @click="showCreatePartnerModal = true">+ 협력 업체 계정 생성</button>
                        <button class="blue filter-btn" @click="handleShowCreateUserModal()">+ 구성원 계정 생성</button>
                    </div>
                    <input type="text" placeholder="이름 🔍" class="main-search search-box" v-model="searchUser"/>
                </div>


                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>부서</th>
                            <th>직위</th>
                            <th>직책</th>
                            <th>프로젝트 생성 권한</th>
                            <th>계정 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(user, index) in paginatedUsers" :key="index" @click="handelUserClick(user.id)">
                            <td>{{ user.name }}</td>
                            <td>{{ user.deptName }}</td>
                            <td>{{ user.jobRankName }}</td>
                            <td>{{ user.jobRoleName }}</td>
                            <td>{{ user.isCreation ? 'O' : 'X' }}</td>
                            <td>
                                <div
                                    :style="{ 
                                        color: user.isResign ? 'red' : 'blue',
                                        backgroundColor: user.isResign ? '#ffdddd' : '#ddddff'
                                    }"
                                    class = "active-card"
                                >
                                    {{ user.isResign ? '비활성' : '활성' }}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="pagination">
                    <button :disabled="currentPage===1" @click="currentPage=1">맨 앞</button>
                    <button :disabled="currentPage === 1" @click="currentPage--">← 이전</button>

                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        @click="changePage(page)"
                        :class="{ current: currentPage === page}"
                    >
                        {{ page }}
                    </button>
                    
                    <button :disabled="currentPage === totalPages" @click="currentPage++">다음 →</button>
                    <button :disabled="currentPage === totalPages" @click="currentPage=totalPages">마지막</button>
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
        <!-- 유저 생성 모달 -->
        <CreateUser 
            v-if="showCreateUserModal" 
            :deptList="filteredDeptList"
            :jobRankList="filteredRankList"
            :jobRoleList="filteredRoleList"
            @close="showCreateUserModal = false" 
            @user-created="createUserInList"
        />
        <!-- 협력업체 계정 생성 모달 -->
        <CreatePartner 
            v-if="showCreatePartnerModal" 
            @close="showCreatePartnerModal = false" 
            @user-created="createUserInList"
        />
    </div>
</template>

<script setup>
    import api from '@/api'
    import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'
    import DeptTree from './DeptTree.vue'
    import UserInfo from '../user/UserInfo.vue'
    import CreateUser from './CreateUser.vue'
    import CreatePartner from './CreatePartner.vue'

    const props = defineProps({
        list: Array,
        title: String
    })

    const showCreateUserModal = ref(false)
    const showCreatePartnerModal = ref(false)

    const deptList = ref([])
    const tree = ref([])
    const expandedIds = ref([])

    const jobRankList = ref([])
    const jobRoleList = ref([])

    const userList = ref([])

    const deptFilter = ref([]);
    const jobRankFilter = ref(null);
    const jobRoleFilter = ref(null);
    const isResignFilter = ref(null); // null-전체, true-활성, false-비활성
    const isCreationFilter = ref(null); // null-전체, true-생성가능, false-생성불가

    const selectedDeptName = computed(() => {
    return Array.isArray(deptFilter.value) && deptFilter.value.length > 0
        ? deptFilter.value[0]
        : null
    })

    const showDropdown = ref({
        dept: false,
        rank: false,
        role: false
    })

    function toggleDropdown(type) {
        showDropdown.value = {
            dept: false,
            rank: false,
            role: false,
            [type]: !showDropdown.value[type]
        }
    }

    function selectFilter(type, value) {
        if (type === 'dept') {
            if (value !== null) {
                onDeptClick(value)
            }
            console.log("deptFilter", deptFilter)
        }
        if (type === 'rank') jobRankFilter.value = value
        if (type === 'role') jobRoleFilter.value = value
        showDropdown.value[type] = false
    }

    function filterClear() {
        deptFilter.value = [];
        jobRankFilter.value = null
        jobRoleFilter.value = null
        isResignFilter.value = null;
        isCreationFilter.value = null;
        searchDept.value = ''
        searchUser.value = ''
    }

    const filterBox = ref(null)

    function handleClickOutside(e) {
        if (filterBox.value && !filterBox.value.contains(e.target)) {
            showDropdown.value = { dept: false, rank: false, role: false }
        }
    }

    const deptFilterIds = ref([])
    function getChildDeptIds(allDepts, parentDeptId) {
        const result = [parentDeptId]
        const children = allDepts.filter(dept => dept.parentDeptId === parentDeptId)

        for (const child of children) {
            result.push(...getChildDeptIds(allDepts, child.id))
        }
        return result
    }

    function onDeptClick(deptId) {
        deptFilterIds.value = getChildDeptIds(deptList.value, deptId)
    }

    const filteredUserList = computed(() => {
        return userList.value.filter(user => {
            const deptMatch = deptFilter.value.length === 0 || deptFilter.value.includes(user.deptName)
            const rankMatch = !jobRankFilter.value || user.jobRankName === jobRankFilter.value
            const roleMatch = !jobRoleFilter.value || user.jobRoleName === jobRoleFilter.value
            const creationMatch = isCreationFilter.value === null || user.isCreation === isCreationFilter.value
            const resignMatch = isResignFilter.value === null || user.isResign === isResignFilter.value
            const nameMatch = !searchUser.value || user.name.includes(searchUser.value)

            return deptMatch && rankMatch && roleMatch && creationMatch && resignMatch && nameMatch
        })
    })

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

    function buildTree(flatList, parentDeptId = null) {
        return flatList
            .filter(dept => dept.parentDeptId === parentDeptId)
            .map(dept => ({
                ...dept,
                children: buildTree(flatList, dept.id)
            }))
    }

    const filteredDeptTree = computed(() => {
        if (!searchDept.value) return buildTree(deptList.value)

        // 이름에 검색 키워드가 포함된 부서들과 그 상위부서들까지 포함
        const keyword = searchDept.value.toLowerCase()
        const matchedIds = new Set()
        const parentMap = {}

        deptList.value.forEach(dept => {
            parentMap[dept.id] = dept.parentDeptId
            if (dept.name.toLowerCase().includes(keyword)) {
                let currentId = dept.id
                while (currentId) {
                    matchedIds.add(currentId)
                    currentId = parentMap[currentId]
                }
            }
        })

        const filteredList = deptList.value.filter(dept => matchedIds.has(dept.id))
        return buildTree(filteredList)
    })


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

    function toggleCreationFilter() {
        if (isCreationFilter.value === null) isCreationFilter.value = true
        else if (isCreationFilter.value === true) isCreationFilter.value = false
        else isCreationFilter.value = null
    }

    function toggleResignFilter() {
        if (isResignFilter.value === null) isResignFilter.value = false
        else if (isResignFilter.value === false) isResignFilter.value = true
        else isResignFilter.value = null
    }


    function updateUserInList(updateUser) {
        const index = userList.value.findIndex(u => u.id === updateUser.id)
        if (index !== -1) {
            userList.value[index] = {
                ...userList.value[index], // 기존 정보 유지
                ...updateUser
            }
        }
    }

    function createUserInList(newUser) {
        userList.value.unshift(newUser)
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

    function handleShowCreateUserModal() {
        showCreateUserModal.value = true;
        isInner.value = true;
    }

    function handelUserClick(userId) {
        selectedUserId.value = userId
        console.log(selectedUserId.value)
        isCreation.value = creation(selectedUserId.value)
        console.log('creation설정', isCreation.value)
        isInner.value = isInnerByUserId(selectedUserId.value)
        console.log('isInner', isInner.value)
    }

    onMounted(async () => {
        const res = await api.get('/api/org/all/info')
        const orgData = res.data.data

        deptList.value = orgData.deptList
        jobRankList.value = orgData.jobRankList
        jobRoleList.value = orgData.jobRoleList

        tree.value = buildDeptTree(deptList.value)
        userList.value = props.list

        document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside)
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

    watch(deptFilterIds, (ids) => {
        if (ids.length === 0) {
            deptFilter.value = null
        } else {
            deptFilter.value = ids
                .map(id => {
                const dept = deptList.value.find(d => d.id === id)
                return dept ? dept.name : null
                })
                .filter(Boolean)
        }
    })

    watch(searchDept, (keyword) => {
        if (!keyword) {
            expandedIds.value = []
            return
        }

        const lowerKeyword = keyword.toLowerCase()
        const matchedDeptIds = new Set()
        const parentMap = {}

        deptList.value.forEach(dept => {
            parentMap[dept.id] = dept.parentDeptId
            if (dept.name.toLowerCase().includes(lowerKeyword)) {
                let currentId = dept.id
                while (currentId) {
                    matchedDeptIds.add(currentId)
                    currentId = parentMap[currentId]
                }
            }
        })
        expandedIds.value = Array.from(matchedDeptIds)
    })

    const usersPerPage = 6
    const currentPage = ref(1)
    const totalPages = computed(() => Math.ceil(filteredUserList.value.length / usersPerPage))

    const paginatedUsers = computed(() => {
        const start = (currentPage.value - 1) * usersPerPage
        return filteredUserList.value.slice(start, start + usersPerPage)
    })
    
    // 페이지 그룹
    const visiblePages = computed(() => {
        const total = totalPages.value
        const cur = currentPage.value
        const pages = []

        const range = 10
        let start = Math.max(1, cur - 1)
        let end = Math.min(total, start + range - 1)

        if (end - start < range - 1) start = Math.max(1, end - range + 1)

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
    })

    function changePage(page) {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }

    function goToInputPage() {
        if (goToInputPage.value >= 1 && goToInputPage.value <= totalPages.value) {
            currentPage.value = goToInputPage.value
            showPageInput.value = false
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
        height: 800px;
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


    .dropdown {
  position: relative;
}

.dropdown-list {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
  z-index: 10;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-list li {
  padding: 6px 10px;
  cursor: pointer;
}
.dropdown-list li:hover {
  background-color: #f0f0f0;
}
</style>