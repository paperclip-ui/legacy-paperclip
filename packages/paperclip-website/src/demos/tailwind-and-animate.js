import { TAILWIND_SOURCE } from "./tailwind.css";

export const TAILWIND_AND_ANIMATE_SOURCE = `
  // file: /main.pc
  <!-- You can include CSS into the scope of this document -->
  <import src="./css-modules/tailwind.css" inject-styles />
  
  <!-- Or you can assign libraries to a specific namespace and use it throughout your doc -->
  <!--import src="animate.css" as="animate" /-->
  
  
  
  <div>
    <div class="h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex justify-center items-center w-full">
      <form>
        <!-- animate in -->
        <div class="$animate animate__animated animate__bounceIn bg-white px-10 py-8 rounded-xl w-screen shadow-md max-w-sm">
          <div class="space-y-4">
            <h1 class="text-center text-2xl font-semibold text-gray-600">
              Register
            </h1>
            <div>
              <label for="email" class="block mb-1 text-gray-600 font-semibold">
                Username
              </label>
              <input type="text"
                class="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" />
            </div>
            <div>
              <label for="email" class="block mb-1 text-gray-600 font-semibold">
                Email
              </label>
              <input type="text"
                class="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" />
            </div>
            <div>
              <label for="email" class="block mb-1 text-gray-600 font-semibold">
                Password
              </label>
              <input type="text"
                class="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" />
            </div>
          </div>
          <button class="mt-4 w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-indigo-100 py-2 rounded-md text-lg tracking-wide">
            Register
          </button>
        </div>
      </form>
    </div>
  </div>

  // file: /css-modules/tailwind.css
  ${TAILWIND_SOURCE}
`;
