### React 19으로 업그레이드 및 설치

React 19로 마이그레이션하려면 몇 가지 주요 단계가 필요합니다.

1.  **React 버전 설치:** `npm` 또는 `yarn`을 사용하여 최신 React 버전을 설치합니다.

    ```bash
    # npm 사용 시
    npm install --save-exact react@^19.0.0 react-dom@^19.0.0

    # yarn 사용 시
    yarn add --exact react@^19.0.0 react-dom@^19.0.0
    ```

2.  **자동 마이그레이션 (Codemod):** React 19의 새로운 API 및 패턴에 맞게 코드를 자동으로 업데이트해주는 도구를 실행할 수 있습니다.

    ```bash
    npx codemod@latest react/19/migration-recipe
    ```

3.  **TypeScript 타입 마이그레이션:** TypeScript를 사용하는 경우, 타입 관련 변경 사항을 자동으로 적용할 수 있습니다.

    ```bash
    npx types-react-codemod@latest preset-19 ./path-to-app
    ```

4.  **`createRoot` API로 전환:** 기존의 `ReactDOM.render`는 `ReactDOM.createRoot`를 사용하는 방식으로 변경해야 합니다.

    ```jsx
    // 이전 방식
    import {render} from 'react-dom';
    render(<App />, document.getElementById('root'));

    // React 19 방식
    import {createRoot} from 'react-dom/client';
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
    ```

### React 19의 새로운 기능 및 개발 방식

React 19는 **React Compiler**와 **Actions**라는 두 가지 큰 축을 중심으로 개발 경험과 성능을 크게 향상시켰습니다.

#### 1. React Compiler

-   **자동 최적화:** React 19부터는 별도의 설정 없이도 코드를 분석하여 자동으로 memoization을 적용하는 최적화 컴파일러가 내장됩니다. 이로 인해 개발자가 `useMemo`, `useCallback`, `memo` 등을 수동으로 사용할 필요가 크게 줄어들어 코드 복잡성이 감소하고 성능은 향상됩니다.

#### 2. Actions: 데이터 변경 및 상태 관리의 혁신

Actions는 폼(form) 제출이나 데이터 변경과 같은 비동기 작업을 더 쉽고 강력하게 다룰 수 있도록 설계된 기능입니다. 로딩, 에러, 성공 상태를 자동으로 관리하여 코드를 크게 단순화합니다.

-   **주요 특징:**
    -   `<form>`의 `action` 속성에 함수를 직접 전달하여 데이터 제출을 처리할 수 있습니다.
    -   `useTransition` 훅과 함께 사용하면 비동기 작업의 처리 상태(`isPending`)를 자동으로 관리합니다.
    -   `useActionState` 훅을 통해 액션의 이전 상태, 결과(에러 등)를 손쉽게 다룰 수 있습니다.

-   **개발 방식의 변화 (Before & After):**

    **이전 방식:** `useState`를 사용하여 로딩, 에러 상태를 수동으로 관리해야 했습니다.

    ```javascript
    function UpdateName() {
      const [name, setName] = useState("");
      const [error, setError] = useState(null);
      const [isPending, setIsPending] = useState(false);

      const handleSubmit = async () => {
        setIsPending(true);
        const error = await updateName(name);
        setIsPending(false);
        if (error) {
          setError(error);
          return;
        }
        redirect("/path");
      };
      // ... JSX ...
    }
    ```

    **React 19 Actions 방식:** `useActionState`를 사용하여 상태 관리를 React에 위임합니다.

    ```javascript
    function ChangeName() {
      // useActionState가 에러, 액션 함수, 팬딩 상태를 모두 반환
      const [error, submitAction, isPending] = useActionState(
        async (previousState, formData) => {
          const error = await updateName(formData.get("name"));
          if (error) {
            return error; // 에러를 반환하면 'error' 상태가 업데이트됨
          }
          redirect("/path");
          return null;
        },
        null // 초기 에러 상태
      );

      return (
        <form action={submitAction}>
          <input type="text" name="name" />
          <button type="submit" disabled={isPending}>Update</button>
          {error && <p>{error}</p>}
        </form>
      );
    }
    ```

#### 3. `use` Hook: 유연한 Context 사용

-   기존 `useContext`는 최상위 레벨에서만 호출할 수 있었지만, `use` 훅은 `if`문이나 `for`문과 같은 조건문, 반복문 안에서도 호출할 수 있습니다. 이를 통해 렌더링 로직을 더 유연하게 구성할 수 있습니다.

    ```jsx
    function Heading({children}) {
      if (children == null) {
        return null; // 조기 반환
      }
      // if문 이후에도 context를 읽을 수 있음
      const theme = use(ThemeContext);
      return <h1 style={{color: theme.color}}>{children}</h1>;
    }
    ```

#### 4. `<Activity>` 컴포넌트: UI 가시성 제어

-   화면에 보이지 않는 UI를 미리 렌더링하거나, 백그라운드에서 작업을 처리할 때 사용합니다. `mode`를 `'hidden'`으로 설정하면 해당 컴포넌트는 보이지 않지만 마운트된 상태를 유지하여, 다시 'visible'이 될 때 빠르게 나타날 수 있습니다.

    ```jsx
    <Activity mode={isVisible ? 'visible' : 'hidden'}>
      <Page />
    </Activity>
    ```

### 요약

React 19는 **Compiler**를 통해 개발자의 최적화 부담을 줄이고, **Actions**를 통해 비동기 상태 관리를 혁신적으로 단순화했습니다. 또한 `use` 훅과 같은 새로운 API를 통해 코드 작성의 유연성을 높여 전반적인 개발 경험을 크게 향상시켰습니다. 업그레이드 시에는 제공되는 `codemod`를 활용하여 마이그레이션을 원활하게 진행할 수 있습니다.
