const Loading = () => {
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
      }}
      className="top-0 left-0 bg-[var(--light)] h-screen w-screen flex justify-center items-center"
    >
      <div className="w-[50px] h-[50px]">
        <svg
          width="32px"
          height="32px"
          viewBox="0 0 105 105"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          color="var(--primary-shade-b)"
        >
          <circle cx="12.5" cy="12.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="0s"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="12.5" cy="52.5" r="12.5" fillOpacity=".5">
            <animate
              attributeName="fillOpacity"
              begin="100ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="52.5" cy="12.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="300ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="52.5" cy="52.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="600ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="92.5" cy="12.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="800ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="92.5" cy="52.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="400ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="12.5" cy="92.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="700ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="52.5" cy="92.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="500ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
          <circle cx="92.5" cy="92.5" r="12.5">
            <animate
              attributeName="fillOpacity"
              begin="200ms"
              dur="1s"
              values="1;.2;1"
              calcMode="linear"
              repeatCount="indefinite"
            ></animate>
          </circle>
        </svg>
      </div>
    </div>
  );
};

export default Loading;
