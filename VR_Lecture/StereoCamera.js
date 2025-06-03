function StereoCamera(eyeSeparation, focalLength, aspect, fov, znear, zfar) {
  this.eyeSeparation = eyeSeparation;
  this.focalLength = focalLength;
  this.aspect = aspect;
  this.fov = fov;
  this.znear = znear;
  this.zfar = zfar;

  this.calcLeftFrustum = function () {
    let top = this.znear * Math.tan(this.fov / 2.0);
    let bottom = -top;

    let right0 = top * this.aspect;
    let left0 = -right0;

    let shift = (this.eyeSeparation / 2.0) * (this.znear / this.focalLength);

    let left = left0 + shift;
    let right = right0 + shift;

    return m4.frustum(left, right, bottom, top, this.znear, this.zfar);
  };

  this.calcRightFrustum = function () {
    let top = this.znear * Math.tan(this.fov / 2.0);
    let bottom = -top;
    let right0 = top * this.aspect;
    let left0 = -right0;
    let shift = (this.eyeSeparation / 2.0) * (this.znear / this.focalLength);

    let left = left0 - shift;
    let right = right0 - shift;
    return m4.frustum(left, right, bottom, top, this.znear, this.zfar);
  };
}
